import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Loader, TransformOptions } from 'esbuild'
import type { Buffer } from 'node:buffer'

export async function transformRaw(
  file: string,
  type: 'text' | 'bytes',
  transform?: typeof import('esbuild').transform,
  transformFilter?: (id: string | unknown) => boolean,
  options?: TransformOptions,
): Promise<string | Buffer> {
  let contents = await readFile(file, type === 'text' ? 'utf8' : undefined)

  if (type === 'text' && transformFilter?.(file)) {
    transform ||= (await import('esbuild')).transform
    contents = (
      await transform(contents, {
        loader: guessLoader(file),
        ...options,
      })
    ).code
  }

  return type === 'bytes'
    ? contents
    : `export default ${JSON.stringify(contents)}`
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
