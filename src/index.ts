import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import { createFilter } from 'unplugin-utils'
import { resolveOptions, type Options } from './core/options'
import type { Loader, TransformOptions } from 'esbuild'
import type { PluginContext } from 'rollup'

const unplugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
  (rawOptions = {}, meta) => {
    const options = resolveOptions(rawOptions)
    const transformFilter = createFilter(
      options.transform.include,
      options.transform.exclude,
    )

    return {
      name: 'unplugin-raw',
      enforce: options.enforce,

      resolveId:
        meta.framework === 'rollup' || meta.framework === 'rolldown'
          ? async function (this, id, importer, opt) {
              const attributeType = (opt as any)?.attributes?.type
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
        filter: { id: { include: rawRE } },
        async handler(id) {
          const file = cleanUrl(id)
          const context = this.getNativeBuildContext?.()
          const transform =
            context?.framework === 'esbuild'
              ? context.build.esbuild.transform
              : undefined
          const contents = await transformRaw(
            file,
            transformFilter,
            false,
            options.transform.options,
            transform,
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
                transformFilter,
                isBytes,
                options.transform.options,
                build.esbuild.transform,
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

const rawRE = /[&?]raw(?:&|$)/
// const bytesRE = /[&?]bytes(?:&|$)/
const postfixRE = /[#?].*$/s
function cleanUrl(url: string) {
  return url.replace(postfixRE, '')
}

const ExtToLoader: Record<string, Loader> = {
  '.js': 'js',
  '.mjs': 'js',
  '.cjs': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.cts': 'ts',
  '.mts': 'ts',
  '.tsx': 'tsx',
  '.css': 'css',
  '.less': 'css',
  '.stylus': 'css',
  '.scss': 'css',
  '.sass': 'css',
  '.json': 'json',
  '.txt': 'text',
}

export function guessLoader(id: string): Loader {
  return ExtToLoader[path.extname(id).toLowerCase()] || 'js'
}

async function transformRaw(
  file: string,
  transformFilter: (id: string | unknown) => boolean,
  isBytes: boolean,
  options: TransformOptions,
  transform?: typeof import('esbuild').transform,
) {
  let contents = await readFile(file, isBytes ? undefined : 'utf8')

  if (!isBytes && transformFilter(file)) {
    transform ||= (await import('esbuild')).transform
    contents = (
      await transform(contents, { loader: guessLoader(file), ...options })
    ).code
  }
  return isBytes ? contents : `export default ${JSON.stringify(contents)}`
}
