import { store, ignore, createStore, StoreBase, config } from '..'

describe('index', () => {
  test(`index should export ' config, store, ignore, createStore, StoreBase'`, () => {
    expect(config).toBeInstanceOf(Function)
    expect(store).toBeInstanceOf(Function)
    expect(ignore).toBeInstanceOf(Function)
    expect(createStore).toBeInstanceOf(Function)
    expect(StoreBase).toBeInstanceOf(Function)
  })
})
