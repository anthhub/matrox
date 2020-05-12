import { Options } from '../../types/store'
import { StoreBase, store, ignore } from '../..'
import { _meta, _updatePropsWithoutRender } from '../StoreBase'
import getInjection from '../getInjection'
import { genClassKey } from '../../core/utils'
import { JSDOM } from 'jsdom'
import { promises } from 'dns'

describe('StoreBase', () => {
  const dom = new JSDOM()
  const document = { location: { toString: () => `https://www.npmjs.com/package/matrox` } }
  ;(global as any).document = { ...dom.window.document, ...document }

  const options1: Options = { middlewares: [] }

  @store('application', options1)
  class A extends StoreBase<A> {
    name = '1'
    age = 0
    money = 0
  }

  const storeA = getInjection(A) as Readonly<A>

  const mockForceUpdate1 = jest.fn(() => undefined)
  const mockForceUpdate2 = jest.fn(() => undefined)
  const mockForceUpdate3 = jest.fn(() => undefined)

  const lisener1 = {
    forceUpdate: mockForceUpdate1,
    comp: {},
    watchedProps: new Set<string>(['name'])
  }

  const lisener2 = {
    forceUpdate: mockForceUpdate2,
    comp: {},
    watchedProps: new Set<string>(['age'])
  }

  const lisener3 = {
    forceUpdate: mockForceUpdate3,
    comp: {},
    watchedProps: new Set<string>(['money'])
  }

  const liseners = [lisener1, lisener2, lisener3]
  ;(storeA as any)[_meta].liseners = liseners

  test('_updatePropsWithoutRender method should update class without render', async () => {
    expect((storeA as any)[_meta]).toEqual({
      liseners: liseners,
      options: options1,
      scope: 'application',
      key: genClassKey(A).key,
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
    expect(storeA.age).toBe(3)

    storeA.setProps(() => ({ age: 4 }))
    expect(mockForceUpdate2.mock.calls.length).toBe(0)
    expect(storeA.age).toBe(4)

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
})
