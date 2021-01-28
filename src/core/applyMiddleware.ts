import compose from './compose'
import StoreBase, { _meta, _updatePropsWithoutRender } from '../api/StoreBase'
import { MiddleWare, StoreAPI } from '../types/middleware'

const applyMiddleware = (...middlewares: MiddleWare[]) => {
  return <T extends StoreBase<any>>(store: T) => {
    let dispatch: any = () => {
      throw new Error(
        `Matrox: dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.`
      )
    }

    const { liseners, ...rest } = store[_meta]

    const storeAPI: StoreAPI = {
      meta: rest,
      updatePropsWithoutRender: store[_updatePropsWithoutRender],
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

export default applyMiddleware
