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
        meta.framework === 'rollup'
          ? async function (this, id, importer, opt) {
              if ((opt as any)?.attributes?.type === 'text') {
                if (id.includes('?')) {
                  id += '&raw'
                } else {
                  id += '?raw'
                }
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
        handler(id) {
          const file = cleanUrl(id)
          const context = this.getNativeBuildContext?.()
          const transform =
            context?.framework === 'esbuild'
              ? context.build.esbuild.transform
              : undefined
          return transformRaw(
            file,
            transformFilter,
            options.transform.options,
            transform,
          )
        },
      },
      esbuild: {
        setup(build) {
          build.onLoad({ filter: /.*/ }, async (args) => {
            if (args.with.type === 'text') {
              const contents = await transformRaw(
                args.path,
                transformFilter,
                options.transform.options,
                build.esbuild.transform,
              )
              return { contents, loader: 'js' }
            }
          })
        },
      },
    }
  },
)
export default unplugin

const rawRE = /[&?]raw(?:&|$)/
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
  options: TransformOptions,
  transform?: typeof import('esbuild').transform,
) {
  let contents = await readFile(file, 'utf-8')

  if (transformFilter(file)) {
    transform ||= (await import('esbuild')).transform
    contents = (
      await transform(contents, { loader: guessLoader(file), ...options })
    ).code
  }
  return `export default ${JSON.stringify(contents)}`
}
