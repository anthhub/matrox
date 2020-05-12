import store from '../store'
import { StoreBase } from '../..'
import { _meta } from '../StoreBase'
import { JSDOM } from 'jsdom'
import preload from '../preload'

describe('preload', () => {
  test(`function preload should preload store`, () => {
    const dom = new JSDOM()
    const document = { location: { toString: () => `https://www.npmjs.com/package/matrox` } }
    ;(global as any).document = { ...dom.window.document, ...document }

    const mockInitCallback = jest.fn(() => undefined)
    const mockInitCallback1 = jest.fn(() => undefined)

    @store('application')
    class A extends StoreBase<A> {
      init() {
        mockInitCallback()
      }

      constructor() {
        super()
        this.init()
      }
    }

    @store('session')
    class B extends StoreBase<B> {
      init() {
        mockInitCallback1()
      }

      constructor() {
        super()
        this.init()
      }
    }

    preload(A)
    preload(B)

    expect(mockInitCallback.mock.calls.length).toBe(1)
    expect(mockInitCallback1.mock.calls.length).toBe(0)
  })
})
