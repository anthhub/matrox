import { Options } from '../../types/store'
import { StoreBase } from '../..'
import { _meta, _updatePropsWithoutRender } from '../StoreBase'
import getInjection from '../getInjection'
import { genClassKey } from '../../core/utils'

import store from '../store'
import { CompType, Lisener, Role } from '../../types/StoreBase'

describe('StoreBase', () => {
  const options1: Options = { middlewares: [] }

  @store(options1)
  class A extends StoreBase<A> {
    name = '1'
    age = 0
    money = 0
  }

  const storeA = getInjection(A) as Readonly<A>

  const mockForceUpdate1 = jest.fn(() => undefined)
  const mockForceUpdate2 = jest.fn(() => undefined)
  const mockForceUpdate3 = jest.fn(() => undefined)

  const lisener1: Lisener = {
    forceUpdate: mockForceUpdate1,
    self: {},
    watchedProps: new Set<string>(['name']),
    compType: CompType.FUNCTION,
    role: Role.COMPONENT
  }

  const lisener2: Lisener = {
    forceUpdate: mockForceUpdate2,
    self: {},
    watchedProps: new Set<string>(['age']),
    compType: CompType.FUNCTION,
    role: Role.COMPONENT
  }

  const lisener3: Lisener = {
    forceUpdate: mockForceUpdate3,
    self: {},
    watchedProps: new Set<string>(['money']),
    compType: CompType.FUNCTION,
    role: Role.COMPONENT
  }

  const liseners = [lisener1, lisener2, lisener3]
  ;(storeA as any)[_meta].liseners = liseners

  test('_updatePropsWithoutRender method should update class without render', async () => {
    expect((storeA as any)[_meta]).toEqual({
      initialValues: {
        age: 0,
        money: 0,
        name: '1'
      },
      liseners: liseners,
      options: options1,
      key: genClassKey(A, '').key,
      storeName: 'A',
      ignoredProps: []
    })

    // 隐藏更新api
    ;(storeA as any)[_updatePropsWithoutRender]({ name: '2' })
    expect(storeA.name).toBe('2')
    expect(mockForceUpdate1.mock.calls.length).toBe(0)
    expect(mockForceUpdate2.mock.calls.length).toBe(0)
    expect(mockForceUpdate3.mock.calls.length).toBe(0)
  })

  test('setProps method should merge actions, batching update class and batching render liseners', async () => {
    // 批量更新api
    storeA.setProps({ age: 1 })
    storeA.setProps({ age: 2 }, 'one')
    storeA.setProps({ age: 3 }, undefined)

    // 异步
    expect(mockForceUpdate2.mock.calls.length).toBe(0)
    expect(storeA.age).toBe(0)

    storeA.setProps(() => ({ age: 4 }))
    expect(mockForceUpdate2.mock.calls.length).toBe(0)
    expect(storeA.age).toBe(0)

    await storeA.setProps({ age: 5 })
    expect(mockForceUpdate2.mock.calls.length).toBe(1)
    expect(storeA.age).toBe(5)

    // action形式
    await storeA.setProps({ payload: { age: 6 }, type: 'two' })
    expect(mockForceUpdate2.mock.calls.length).toBe(2)
    expect(storeA.age).toBe(6)

    // 函数action
    await storeA.setProps(() => ({ payload: { age: 7 }, type: 'three' }))
    expect(mockForceUpdate2.mock.calls.length).toBe(3)
    expect(storeA.age).toBe(7)

    expect(mockForceUpdate1.mock.calls.length).toBe(0)
    expect(mockForceUpdate3.mock.calls.length).toBe(0)
  })

  test('forceUpdate method should batching update class and batching render liseners', async () => {
    expect(mockForceUpdate1.mock.calls.length).toBe(0)
    expect(mockForceUpdate2.mock.calls.length).toBe(3)
    expect(mockForceUpdate3.mock.calls.length).toBe(0)

    await storeA.forceUpdate()

    expect(mockForceUpdate1.mock.calls.length).toBe(1)
    expect(mockForceUpdate2.mock.calls.length).toBe(4)
    expect(mockForceUpdate3.mock.calls.length).toBe(1)

    // 批量更新
    storeA.forceUpdate()
    storeA.forceUpdate()
    storeA.forceUpdate()

    await Promise.resolve()

    expect(mockForceUpdate1.mock.calls.length).toBe(2)
    expect(mockForceUpdate2.mock.calls.length).toBe(5)
    expect(mockForceUpdate3.mock.calls.length).toBe(2)
  })

  test('forceUpdateSync method should update class and render liseners directly', async () => {
    expect(mockForceUpdate1.mock.calls.length).toBe(2)
    expect(mockForceUpdate2.mock.calls.length).toBe(5)
    expect(mockForceUpdate3.mock.calls.length).toBe(2)

    storeA.forceUpdateSync()

    expect(mockForceUpdate1.mock.calls.length).toBe(3)
    expect(mockForceUpdate2.mock.calls.length).toBe(6)
    expect(mockForceUpdate3.mock.calls.length).toBe(3)

    // 批量更新
    storeA.forceUpdateSync()
    storeA.forceUpdateSync()
    storeA.forceUpdateSync()

    await Promise.resolve()

    expect(mockForceUpdate1.mock.calls.length).toBe(6)
    expect(mockForceUpdate2.mock.calls.length).toBe(9)
    expect(mockForceUpdate3.mock.calls.length).toBe(6)
  })

  test('resetStore method should reset properties of store', async () => {
    await storeA.setProps({ age: 99, money: 99, name: '99' })
    expect(storeA.age).toBe(99)
    expect(storeA.money).toBe(99)
    expect(storeA.name).toBe('99')

    storeA.resetStore()
    expect(storeA.age).toBe(0)
    expect(storeA.money).toBe(0)
    expect(storeA.name).toBe('1')
  })
})
