import { getInjector } from '../core/Injector'

import StoreBase, { _meta } from './StoreBase'
import { Constructor } from '../types/store'
import { Payload } from '../types/StoreBase'
const injector = getInjector()

const cache = new Map()

const getInjection = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  args?: Payload<T>,
  identification: number | string = ''
): Readonly<T> | undefined => {
  return injector.get(InjectedStoreClass, args, [], identification)
}

export default getInjection
