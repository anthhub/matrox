import { Options } from '../../types/store'
import { StoreBase, store, ignore } from '../..'
import { _meta, _updatePropsWithoutRender } from '../StoreBase'
import getInjection from '../getInjection'
import { genClassKey } from '../../core/utils'
import { JSDOM } from 'jsdom'

describe('StoreBase', () => {
  test('class StoreBase should provide some methods to update the class basing it', async () => {
    const dom = new JSDOM()
    const document = { location: { toString: () => `https://www.npmjs.com/package/matrox` } }
    ;(global as any).document = { ...dom.window.document, ...document }

    const options1: Options = { middlewares: [] }

    @store('application', options1)
    class A extends StoreBase<A> {
      @ignore name = '1'
      @ignore sex = 'man'
      age = 0
    }

    const storeA = getInjection(A) as Readonly<A>

    expect((storeA as any)[_meta]).toEqual({
      liseners: [],
      options: options1,
      scope: 'application',
      key: genClassKey(A).key,
      storeName: 'A',
      ignoredProps: []
    })

    // 隐藏更新api
    ;(storeA as any)[_updatePropsWithoutRender]({ name: '2' })
    expect(storeA.name).toBe('2')

    // 批量更新api
    storeA.setProps({ age: 1 })
    storeA.setProps({ age: 2 }, 'one')

    // 异步
    expect(storeA.age).toBe(0)

    storeA.setProps(() => ({ age: 4 }))
    await storeA.setProps({ age: 5 })
    expect(storeA.age).toBe(5)

    // action形式
    // storeA.setProps({ payload: { age: 6 }, type: 'two' })
    // expect(storeA.age).toBe(0)

    // storeA.setProps(() => ({ payload: { age: 7 }, type: 'three' }))
    // expect(storeA.age).toBe(0)

    // 非法形式
    // expect(() => storeA.setProps({ payload: { age: 6 }, type: undefined })).toThrow()
    // setTimeout(() => {
    //   console.log(storeA.age)
    //   expect(storeA.age).toBe(8)

    //   done()
    // })

    // await storeA.setProps({ age: 8 })
    // expect(storeA.age).toBe(8)
  })
})
