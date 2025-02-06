/**
 * This entry file is for Rolldown plugin.
 *
 * @module
 */

import unplugin from './index'

/**
 * Rolldown plugin
 *
 * @example
 * ```ts
 * // rolldown.config.js
 * import Raw from 'unplugin-raw/rolldown'
 *
 * export default {
 *   plugins: [Raw()],
 * }
 * ```
 */
const rolldown = unplugin.rolldown as typeof unplugin.rolldown
export default rolldown
export { rolldown as 'module.exports' }
