import { getInjector } from '../Injector'
import { store, StoreBase } from '../..'
import { JSDOM } from 'jsdom'
import { _meta } from '../../api/StoreBase'

describe('Injector', () => {
  const dom = new JSDOM()
  const document = { location: { toString: () => `https://www.npmjs.com/package/matrox` } }
  ;(global as any).document = { ...dom.window.document, ...document }

  const injector = getInjector()

  const injectorAny: any = injector

  @store('application')
  class A extends StoreBase<A> {
    name = '1'
  }

  @store('session')
  class B extends StoreBase<B> {
    age = 1
  }

  beforeEach(() => {
    injectorAny.clear()
  })

  test('the get method of Injector class should get a same instance for a same class', () => {
    const injector1 = getInjector()
    expect(injector).toBe(injector1)
  })

  test('the get method of Injector class should get a same instance for a same class', () => {
    const a = injector.get(A, {}, [])
    const a1 = injector.get(A, {}, [])
    expect(a).toStrictEqual(a1)
    expect(injectorAny.appContainer.size).toBe(1)

    const b = injector.get(B, {}, [])
    const b1 = injector.get(B, {}, [])
    expect(b).toStrictEqual(b1)
    expect(injectorAny.sessContainer.size).toBe(1)
  })

  test(`the args parameter of get method of Injector class should effect the instance at it's initiation firstly`, () => {
    const a = injector.get(A, { name: '2' }, [])
    expect(a.name).toBe('2')

    const a1 = injector.get(A, { name: '3' }, [])
    expect(a1.name).toBe('2')

    const b = injector.get(B, () => ({ age: 2 }), [])
    expect(b.age).toBe(2)

    const b1 = injector.get(B, () => ({ age: 3 }), [])
    expect(b1.age).toBe(2)
  })

  test(`the identification parameter of get method of Injector class should control the initiation of instance for session store`, () => {
    let identification = 1

    const b = injector.get(B, () => ({ age: 2 }), [], identification)
    expect(b.age).toBe(2)

    const b1 = injector.get(B, () => ({ age: 3 }), [], identification)
    expect(b1.age).toBe(2)

    // 重新实例化
    identification = 2
    const b2 = injector.get(B, { age: 4 }, [], identification)
    expect(b2.age).toBe(4)
  })

  test(`the subscribe method of Injector class should subscribe the store instance for comp and return a unsubscribe function`, () => {
    const arr = [A, B]

    arr.forEach((Clazz: any) => {
      const forceUpdate = () => undefined
      const forceUpdate1 = () => undefined
      const comp = {}

      const liseners = [{ forceUpdate, comp, watchedProps: new Set<string>() }]
      const liseners1 = [{ forceUpdate: forceUpdate1, comp, watchedProps: new Set<string>() }]

      const unsubscribe = injector.subscribe(Clazz, {}, liseners, `hooks`)
      // 未实例化则实例化
      expect(injectorAny.appContainer.size).toBe(1)

      const a = injector.get(Clazz, {}, liseners)

      expect(a[_meta].liseners.length).toBe(1)
      // 重复注册
      const unsubscribe1 = injector.subscribe(Clazz, {}, liseners1, `hooks`)
      expect(a[_meta].liseners.length).toBe(1)

      unsubscribe1()
      expect(a[_meta].liseners.length).toBe(1)

      unsubscribe()
      expect(a[_meta].liseners.length).toBe(0)
    })
  })
})
