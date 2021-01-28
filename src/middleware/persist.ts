import { MiddleWare, StoreAPI, Dispatch } from '../types/middleware'

import { Action } from '../types/StoreBase'

const persist: MiddleWare = (store: StoreAPI) => {
  const { key } = store.meta || {}

  const state = JSON.parse(localStorage.getItem(key) || '{}')
  store.updatePropsWithoutRender(state)

  return (dispatch: Dispatch) => async (action: Action<any, string>) => {
    await dispatch(action)

    const state = store.getState()
    localStorage.setItem(key, JSON.stringify(state))
  }
}

export default persist
