type StoreAPI = {
  meta: Omit<Meta, 'liseners'>
  getState: () => any
  updatePropsWithoutRender: (payload: Payload<any>) => KVProps<any>
  dispatch: any
}

type Dispatch = (action: Action<any, string>) => void

type MiddleWare = (store: StoreAPI) => (dispatch: Dispatch) => (action: Action<any, string>) => any
