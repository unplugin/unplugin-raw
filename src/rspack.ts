/**
 * This entry file is for Rspack plugin.
 *
 * @module
 */

import unplugin from './index.ts'

/**
 * Rspack plugin
 *
 * @example
 * ```ts
 * // rspack.config.js
 * module.exports = {
 *  plugins: [require('unplugin-raw/rspack')()],
 * }
 * ```
 */
const rspack = unplugin.rspack as typeof unplugin.rspack
export default rspack
export { rspack as 'module.exports' }
