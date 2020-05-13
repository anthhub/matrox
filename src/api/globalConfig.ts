import { GlobalOptions } from '../types/store'

export let globalOptions: GlobalOptions

/**
 * config add apply options for all store
 *
 * @example
 * ```ts
 * import { GlobalOptions } from 'matrox'
 * globalConfig({})
 * ```
 *
 * @param  {GlobalOptions} options global options
 *
 * @see https://github.com/anthhub/matrox#globalConfig
 */
const globalConfig = (options: GlobalOptions) => {
  globalOptions = options
}

export default globalConfig
