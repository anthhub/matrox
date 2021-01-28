import store from '../store'
import { StoreBase } from '../..'
import { Options } from '../../types/store'
import { _meta } from '../StoreBase'
import getInjection from '../getInjection'
import { JSDOM } from 'jsdom'

describe('getInjection', () => {
  test(`function getInjection should get a store by class`, () => {
    const options1: Options = { middlewares: [] }

    @store(options1)
    class A extends StoreBase<A> {}

    const store1 = getInjection(A)

    expect(store1).toBeDefined()
  })
})
