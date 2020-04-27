import compose from './compose'
import StoreBase, { _meta } from '../api/StoreBase'

export default function applyMiddleware(...middlewares: MiddleWare[]) {
  return <T extends StoreBase<any>>(store: T) => {
    let dispatch: any = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.`
      )
    }

    const { liseners, ...rest } = store[_meta]

    const storeAPI: StoreAPI = {
      meta: rest,
      updatePropsWithoutRender: store.updatePropsWithoutRender,
      getState: () => JSON.parse(JSON.stringify(store)),
      dispatch: store.setProps
    }

    const chain = middlewares.map(middleware => middleware(storeAPI))
    dispatch = compose(...chain)(store.setProps)

    store.setProps = dispatch

    return {
      ...store,
      dispatch
    }
  }
}
