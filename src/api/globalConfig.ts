import { GlobalOptions } from '../types/store'

export let globalOptions: GlobalOptions

const globalConfig = (options: GlobalOptions) => {
  globalOptions = options
}

export default globalConfig
