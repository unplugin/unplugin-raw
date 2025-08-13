import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { createFilter } from 'unplugin-utils'
import { resolveOptions, type Options } from './core/options'
import { transformRaw } from './core/transform'
import type { PluginContext } from 'rollup'

const rawRE = /[&?]raw(?:&|$)/
const postfixRE = /[#?].*$/s
function cleanUrl(url: string) {
  return url.replace(postfixRE, '')
}

const unplugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
  (rawOptions = {}, meta) => {
    const options = resolveOptions(rawOptions)
    const transformFilter = options.transform
      ? createFilter(options.transform.include, options.transform.exclude)
      : undefined

    return {
      name: 'unplugin-raw',
      enforce: options.enforce,

      resolveId: ['rollup', 'rolldown', 'vite'].includes(meta.framework)
        ? async function (this, id, importer, options) {
            const attributeType = (options as any)?.attributes?.type
            if (attributeType === 'text') {
              id += `${id.includes('?') ? '&' : '?'}raw`
            } else if (attributeType === 'bytes') {
              id += `${id.includes('?') ? '&' : '?'}bytes`
            }
            if (!rawRE.test(id)) return

            const file = cleanUrl(id)
            const resolved = await (this as PluginContext).resolve(
              file,
              importer,
            )
            if (!resolved) return

            return id.replace(file, resolved.id)
          }
        : undefined,

      load: {
        filter: {
          id: { include: rawRE },
        },
        async handler(id) {
          const file = cleanUrl(id)
          const context = this.getNativeBuildContext?.()
          const transform =
            context?.framework === 'esbuild'
              ? context.build.esbuild.transform
              : undefined
          const contents = await transformRaw(
            file,
            false,
            transform,
            transformFilter,
            options.transform ? options.transform.options : undefined,
          )
          return contents as string
        },
      },

      esbuild: {
        setup(build) {
          build.onLoad({ filter: /.*/ }, async (args) => {
            const isBytes = args.with.type === 'bytes'
            if (args.with.type === 'text' || isBytes) {
              const contents = await transformRaw(
                args.path,
                isBytes,
                build.esbuild.transform,
                transformFilter,
                options.transform ? options.transform.options : undefined,
              )
              return {
                contents,
                loader: typeof contents === 'string' ? 'js' : 'binary',
              }
            }
          })
        },
      },
    }
  },
)
export default unplugin
