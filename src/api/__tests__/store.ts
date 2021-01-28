import ignore from '../ignore'
import store from '../store'
import { StoreBase } from '../..'
import { Options } from '../../types/store'
import { _meta } from '../StoreBase'

describe('store', () => {
  test(`decorator store should get 'ignoredProps' and define 'options' to class `, () => {
    const options1: Options = { persist: true, middlewares: [] }

    @store(options1)
    class A extends StoreBase<A> {
      @ignore name = '1'
      @ignore sex = 'man'
      age = 2
    }

    const { options, ignoredProps } = (A as any)[_meta]

    expect(options).toEqual(options1)
    expect(ignoredProps).toEqual(['name', 'sex'])
  })
})
