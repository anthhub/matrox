import { GlobalOptions } from '../types/store'

export let globalOptions: GlobalOptions

const config = (options: GlobalOptions) => {
  globalOptions = options
}

export default config
