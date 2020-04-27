/* eslint-disable react-hooks/rules-of-hooks */

import getInjection from './getInjection'
import preLoad from './preLoad'
import StoreBase from './StoreBase'
import useInjection from './useInjection'
import injection from './injection'
import { Payload } from '../types/StoreBase'
import { Constructor } from '../types/store'

const createStore = <T extends StoreBase<T>, U extends Payload<T>>(
  InjectedStoreClass: Constructor<T>
) => {
  const useStore = (args?: U) => useInjection(InjectedStoreClass, args)
  const injectStore = (args?: U) => injection(InjectedStoreClass, args)
  const getStore = (args?: U) => getInjection(InjectedStoreClass, args)

  const preLoadStore = (args?: U) => preLoad(InjectedStoreClass, args)

  const getState = () => {
    return JSON.parse(JSON.stringify(getStore() || {}))
  }

  return { useStore, injectStore, getStore, preLoadStore, getState }
}

export default createStore
