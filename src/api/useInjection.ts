import { useEffect, useMemo } from 'react'

import { getInjector } from '../core/Injector'

import StoreBase from './StoreBase'
import { Constructor } from '../types/store'
import { Payload, Lisener } from '../types/StoreBase'
import useThis from '../hooks/useThis'
import useForceUpdate from '../hooks/useForceUpdate'

const injector = getInjector()

const useInjection = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  args?: Payload<T>,
  identification?: number | string
): Readonly<T> => {
  const comp = useThis(args)
  const forceUpdate = useForceUpdate()

  const liseners: Lisener[] = useMemo(
    () => [{ forceUpdate, comp, watchedProps: new Set<string>(), role: 'comp' }],
    []
  )

  useEffect(
    () => injector.subscribe(InjectedStoreClass, args, liseners, `hooks`, identification),
    []
  )

  return injector.get(InjectedStoreClass, args, liseners, identification)
}

export default useInjection
