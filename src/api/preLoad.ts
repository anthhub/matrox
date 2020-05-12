/* eslint-disable react-hooks/rules-of-hooks */

import getInjection from './getInjection'

import StoreBase from './StoreBase'
import { Payload } from '../types/StoreBase'
import { Constructor } from '../types/store'

const preload = <T extends StoreBase<T>, U extends Payload<T>>(
  InjectedStoreClass: Constructor<T>,
  args?: U
) => {
  getInjection(InjectedStoreClass, args)
}

export default preload
