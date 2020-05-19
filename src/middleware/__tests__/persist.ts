import StoreBase, { _meta } from '../../api/StoreBase'

import applyMiddleware from '../../core/applyMiddleware'
import persist from '../persist'
import { genClassKey } from '../../core/utils'
import store from '../../api/store'

describe('applyMiddleware', () => {
  test(`function applyMiddleware should call all middleware when excute 'setProps'`, async () => {
    @store('application')
    class A extends StoreBase<A> {
      age = 0
    }

    const a = new A()
    const { key } = genClassKey(A)
    a[_meta].key = key

    applyMiddleware(persist)(a)

    await a.setProps({ age: 1 })
    expect(a.age).toBe(1)

    const obj = JSON.parse(localStorage.getItem(key) || '{}')
    expect(obj).toStrictEqual(JSON.parse(JSON.stringify(a)))

    await a.setProps({ age: 100 })
    expect(a.age).toBe(100)

    const obj1 = JSON.parse(localStorage.getItem(key) || '{}')
    expect(obj1).toStrictEqual(JSON.parse(JSON.stringify(a)))
  })
})
