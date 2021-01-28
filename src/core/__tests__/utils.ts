import { hashCode, getClassName, genClassKey, mergeOptions, collectDependences } from '../utils'

import { StoreBase } from '../..'
import { Options, GlobalOptions } from '../../types/store'
import persist from '../../middleware/persist'
import { CompType, Lisener, Role } from '../../types/StoreBase'

describe('Injector utils', () => {
  class A extends StoreBase<A> {}
  class B extends StoreBase<A> {}
  const A1 = A

  test('function hashCode should generate a unique hash code', () => {
    const a = hashCode(A.toString())
    const a1 = hashCode(A1.toString())
    const b = hashCode(B.toString())

    expect(a).not.toBe(b)
    expect(a1).toBe(a)
  })

  test('function getClassName should get class name', () => {
    const a = getClassName(A)
    const a1 = getClassName(A1)
    const b = getClassName(B)

    expect(a).toBe(`A`)
    expect(a1).toBe(`A`)
    expect(b).toBe(`B`)
  })

  test('function genClassKey should generate a unique key for class', () => {
    const a = genClassKey(A)
    const a1 = genClassKey(A1)
    const b = genClassKey(B)

    expect(a.key).toBe(a1.key)
    expect(b.key).not.toBe(a.key)
  })

  test('function mergeOptions should merge options and globalOptions', () => {
    const options: Options = {}
    const globalOptions: GlobalOptions = { persist: true }

    const newOptions = mergeOptions(options, globalOptions)

    expect(newOptions.persist).toBeTruthy()
    expect(newOptions.middlewares).toEqual([persist])

    const options1: Options = { ignoreMiddlewares: [persist] }
    const globalOptions1: GlobalOptions = { middlewares: [persist] }

    const newOptions1 = mergeOptions(options1, globalOptions1)

    expect(newOptions1.middlewares).toEqual([])
  })

  test('function collectDependences should return a proxy instance watching some properties', () => {
    const _money = Symbol('_money')

    class A extends StoreBase<A> {
      [_money] = 0
      name = 'jack'
      sex = 'man'
      age = 18

      eat = () => undefined
    }

    const a = new A()

    const watchedProps = new Set<string>()

    const liseners: Lisener[] = [
      {
        forceUpdate: () => {
          return
        },
        self: {},
        watchedProps,
        compType: CompType.FUNCTION,
        role: Role.COMPONENT
      }
    ]

    const proxyInstance = collectDependences(a, liseners, ['age'])

    expect(proxyInstance).toBeDefined()

    expect(proxyInstance).toBeInstanceOf(A)

    // 依赖收集
    const _ = proxyInstance.name
    expect([...watchedProps]).toEqual(['name'])

    // 依赖收集
    const _1 = proxyInstance.sex
    expect([...watchedProps]).toEqual(['name', 'sex'])

    // 避免依赖收集
    const _3 = proxyInstance.age
    expect([...watchedProps]).toEqual(['name', 'sex'])

    const _4 = proxyInstance.eat
    expect([...watchedProps]).toEqual(['name', 'sex'])

    const _5 = proxyInstance[_money]
    expect([...watchedProps]).toEqual(['name', 'sex'])

    // readonly
    expect(() => (proxyInstance[_money] = 2)).not.toThrow()

    expect(() => (proxyInstance.name = 'stupid')).toThrow()

    expect(() => (proxyInstance.eat = () => undefined)).toThrow()
  })
})
