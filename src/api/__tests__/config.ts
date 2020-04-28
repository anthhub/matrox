import { GlobalOptions } from '../../types/store'
import { config } from '../..'

describe('config', () => {
  test('function config should config globalOptions', () => {
    const globalOptions: GlobalOptions = {}
    config(globalOptions)

    expect(globalOptions).toBe(globalOptions)
  })
})
