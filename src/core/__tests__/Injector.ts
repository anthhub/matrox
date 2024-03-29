import { getInjector } from '../Injector'
import { StoreBase } from '../..'
import { JSDOM } from 'jsdom'
import { _meta } from '../../api/StoreBase'

import { CompType, Lisener, Role } from '../../types/StoreBase'
import store from '../../api/store'

describe('Injector', () => {
  const injector = getInjector()

  const injectorAny: any = injector

  @store()
  class A extends StoreBase<A> {
    name = '1'
  }

  @store()
  class B extends StoreBase<B> {
    age = 0
  }

  beforeEach(() => {
    injectorAny.clear()
  })

  test('the get method of Injector class should get a same instance for a same class', () => {
    const injector1 = getInjector()
    expect(injector).toBe(injector1)
  })

  test('the get method of Injector class should get a same instance for a same class', () => {
    const a = injector.get(A, [], '')
    const a1 = injector.get(A, [])
    expect(a).toStrictEqual(a1)
    expect(injectorAny.appContainer.size).toBe(1)
  })

  test(`the identification parameter of get method of Injector class should control the initiation of instance for session store`, () => {
    const b = injector.get(B, [], 1)

    const b1 = injector.get(B, [], 2)
    expect(b1).not.toBe(b)
  })

  test(`the subscribe method of Injector class should subscribe the store instance for comp and return a unsubscribe function`, () => {
    const arr = [A]

    arr.forEach((Clazz: any) => {
      const forceUpdate = () => undefined
      const forceUpdate1 = () => undefined

      const [self, compType, role] = [{}, CompType.FUNCTION, Role.COMPONENT]

      const liseners: Lisener[] = [
        { forceUpdate, self, watchedProps: new Set<string>(), compType, role }
      ]
      const liseners1: Lisener[] = [
        { forceUpdate: forceUpdate1, self, watchedProps: new Set<string>(), compType, role }
      ]

      const unsubscribe = injector.subscribe(Clazz, liseners, compType)
      // 未实例化则实例化
      expect(injectorAny.appContainer.size).toBe(1)

      const a = injector.get(Clazz, liseners)

      expect(a[_meta].liseners.length).toBe(1)
      // 重复注册
      const unsubscribe1 = injector.subscribe(Clazz, liseners1, compType)
      expect(a[_meta].liseners.length).toBe(1)

      unsubscribe1()
      expect(a[_meta].liseners.length).toBe(1)

      unsubscribe()
      expect(a[_meta].liseners.length).toBe(0)
    })
  })
})
