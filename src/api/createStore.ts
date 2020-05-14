import getInjection from './getInjection'
import StoreBase from './StoreBase'
import useInjection from './useInjection'
import injection from './injection'
import preload from './preload'
import { Payload } from '../types/StoreBase'
import { Constructor } from '../types/store'

const createStore = <T extends StoreBase<T>, U extends Payload<T>>(
  InjectedStoreClass: Constructor<T>
) => {
  const useStore = (args?: U) => useInjection(InjectedStoreClass, args)
  const injectStore = (args?: U) => injection(InjectedStoreClass, args)
  const getStore = (args?: U) => getInjection(InjectedStoreClass, args)

  const preloadStore = (args?: U) => preload(InjectedStoreClass, args)

  const getState = () => {
    return JSON.parse(JSON.stringify(getStore() || {}))
  }

  return { useStore, injectStore, getStore, preloadStore, getState }
}

export default createStore
