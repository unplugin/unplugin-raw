import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { type UnpluginInstance, createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { type Options, resolveOptions } from './core/options'
import type { PluginContext } from 'rollup'
import type { Loader } from 'esbuild'

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
          ? async function (this, id, importer) {
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

      loadInclude: (id) => rawRE.test(id),
      async load(id) {
        const file = cleanUrl(id)
        let contents = await readFile(file, 'utf-8')
        if (transformFilter(file)) {
          let transform: typeof import('esbuild').transform
          if (meta.framework === 'esbuild') {
            ;({ transform } = meta.build!.esbuild)
          } else {
            transform = (await import('esbuild')).transform
          }
          contents = (
            await transform(contents, {
              loader: guessLoader(file),
              ...options.transform.options,
            })
          ).code
        }
        return `export default ${JSON.stringify(contents)}`
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
