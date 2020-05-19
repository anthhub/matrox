import applyMiddleware from '../applyMiddleware'
import StoreBase from '../../api/StoreBase'

import { StoreAPI, Dispatch } from '../../types/middleware'
import { Action } from '../../types/StoreBase'
import store from '../../api/store'

describe('applyMiddleware', () => {
  test(`function applyMiddleware should excute all middleware when excute 'setProps'`, async () => {
    @store('application')
    class A extends StoreBase<A> {
      age = 0
    }

    const a = new A()

    let order = ''
    let count = 0
    const middleware = (store: StoreAPI) => {
      return (dispatch: Dispatch) => (action: Action<any, string>) => {
        dispatch(action)
        count++
        order += '1'
      }
    }

    let count1 = 0
    const middleware1 = (store: StoreAPI) => {
      return (dispatch: Dispatch) => (action: Action<any, string>) => {
        dispatch(action)
        count1--
        order += '2'
      }
    }

    applyMiddleware(middleware, middleware1)(a)

    await a.setProps({ age: 1 })
    expect(a.age).toBe(1)
    expect(count).toBe(1)
    expect(count1).toBe(-1)
    expect(order).toBe('21')

    await a.setProps({ age: 1 })
    expect(a.age).toBe(1)
    expect(count).toBe(2)
    expect(count1).toBe(-2)
    expect(order).toBe('2121')
  })
})
