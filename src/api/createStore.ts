/* eslint-disable react-hooks/rules-of-hooks */

import { useInjection, injection } from '..'
import getInjection from './getInjection'

import preLoad from './preLoad'

import StoreBase from './StoreBase'

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
