import store from '../store'
import { StoreBase, createStore } from '../..'
import { _meta } from '../StoreBase'
import { JSDOM } from 'jsdom'
import preLoad from '../preLoad'

describe('createStore', () => {
  test(`function createStore should generate 'useStore, injectStore, getStore, preLoadStore, getState'`, () => {
    @store('application')
    class A extends StoreBase<A> {}

    const { useStore, injectStore, getStore, preLoadStore, getState } = createStore(A)

    expect(useStore).toBeInstanceOf(Function)
    expect(injectStore).toBeInstanceOf(Function)
    expect(getStore).toBeInstanceOf(Function)
    expect(preLoadStore).toBeInstanceOf(Function)
    expect(getState).toBeInstanceOf(Function)
  })
})
