import type { FilterPattern } from '@rollup/pluginutils'
import type { TransformOptions } from 'esbuild'

export interface Options {
  /** @default 'pre' */
  enforce?: 'pre' | 'post' | undefined
  /** Transform */
  transform?: {
    /** @default [/\.[cm]?[jt]sx?$/] */
    include?: FilterPattern
    /** @default [/node_modules/] */
    exclude?: FilterPattern
    /** @default {} */
    options?: TransformOptions
  }
}

export type OptionsResolved = Pick<Options, 'enforce'> & {
  transform: NonNullable<Required<Options['transform']>>
}

export function resolveOptions(options: Options): OptionsResolved {
  return {
    ...options,
    enforce: 'enforce' in options ? options.enforce : 'pre',
    transform: {
      ...options.transform,
      include: options.transform?.include || [/\.[cm]?[jt]sx?$/],
      exclude: options.transform?.exclude || [/node_modules/],
      options: options.transform?.options || {},
    },
  }
}
