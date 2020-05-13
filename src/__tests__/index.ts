import { store, ignore, createStore, StoreBase, globalConfig } from '..'

describe('index', () => {
  test(`index should export ' config, store, ignore, createStore, StoreBase'`, () => {
    expect(globalConfig).toBeInstanceOf(Function)
    expect(store).toBeInstanceOf(Function)
    expect(ignore).toBeInstanceOf(Function)
    expect(createStore).toBeInstanceOf(Function)
    expect(StoreBase).toBeInstanceOf(Function)
  })
})
