import store from '../store'
import { StoreBase } from '../..'
import { Options } from '../../types/store'
import { _meta } from '../StoreBase'
import getInjection from '../getInjection'
import { JSDOM } from 'jsdom'

describe('getInjection', () => {
  test(`function getInjection should get a store by class`, () => {
    const dom = new JSDOM()
    const document = { location: { toString: () => `https://www.npmjs.com/package/matrox` } }
    ;(global as any).document = { ...dom.window.document, ...document }

    const options1: Options = { middlewares: [] }

    @store('application', options1)
    class A extends StoreBase<A> {}

    @store('session', options1)
    class B extends StoreBase<B> {}

    const store1 = getInjection(A)
    const store2 = getInjection(B)

    expect(store1).toBeDefined()
    expect(store1).toBe(getInjection(A))

    expect(store2).toBeUndefined()
  })
})
