import { GlobalOptions } from '../../types/store'
import { globalConfig } from '../..'

describe('config', () => {
  test('function config should config globalOptions', () => {
    const globalOptions: GlobalOptions = {}
    globalConfig(globalOptions)

    expect(globalOptions).toBe(globalOptions)
  })
})
