import { Action, Meta, Payload, KVProps } from './StoreBase'

export type Dispatch = (action: Action<any, string>) => Promise<void>

export type MiddleWare = (
  store: StoreAPI
) => (dispatch: Dispatch) => (action: Action<any, string>) => any

export type StoreAPI = {
  meta: Omit<Meta, 'liseners'>
  getState: () => any
  updatePropsWithoutRender: (payload: Payload<any>) => KVProps<any>
  dispatch: Dispatch
}
