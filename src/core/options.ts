import type { TransformOptions as EsbuildTransformOptions } from 'esbuild'
import type { FilterPattern } from 'unplugin-utils'

export interface TransformOptions {
  /** @default [/\.[cm]?[jt]sx?$/] */
  include?: FilterPattern
  /** @default [/node_modules/] */
  exclude?: FilterPattern
  /** @default {} */
  options?: EsbuildTransformOptions
}

export interface Options {
  /** @default 'pre' */
  enforce?: 'pre' | 'post' | undefined
  /**
   * Transform
   * @default false
   */
  transform?: TransformOptions | boolean
}

export type OptionsResolved = Pick<Options, 'enforce'> & {
  transform: TransformOptions | false
}

export function resolveOptions(options: Options): OptionsResolved {
  let { transform = false } = options
  if (transform === true) {
    transform = {}
  }

  return {
    ...options,
    enforce: 'enforce' in options ? options.enforce : 'pre',
    transform: transform
      ? {
          ...transform,
          include: transform.include || [/\.[cm]?[jt]sx?$/],
          exclude: transform.exclude || [/node_modules/],
          options: transform.options || {},
        }
      : false,
  }
}
