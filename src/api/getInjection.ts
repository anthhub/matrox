import { getInjector } from '../core/Injector'

import StoreBase, { _meta } from './StoreBase'
import { Constructor, Scope } from '../types/store'
import { Payload } from '../types/StoreBase'
const injector = getInjector()

const cache = new Map()

const getInjection = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  args?: Payload<T>
): Readonly<T> | undefined => {
  const scope: Scope = (InjectedStoreClass as any)[_meta].scope

  if (scope === 'session') {
    return
  }

  if (!cache.get(InjectedStoreClass)) {
    cache.set(InjectedStoreClass, injector.get(InjectedStoreClass, args, []))
  }

  return cache.get(InjectedStoreClass)
}

export default getInjection
