import { getInjector } from '../core/Injector'

import StoreBase, { _meta } from './StoreBase'
import { Constructor } from '../types/store'

const injector = getInjector()

const getInjection = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  identification: number | string
): Readonly<T> | undefined => {
  return injector.get(InjectedStoreClass, [], identification)
}

export default getInjection
