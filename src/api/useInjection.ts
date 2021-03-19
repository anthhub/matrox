import { useEffect, useMemo } from 'react'

import { getInjector } from '../core/Injector'

import StoreBase from './StoreBase'
import { Constructor } from '../types/store'
import { Payload, Lisener, Role, CompType } from '../types/StoreBase'
import useThis from '../hooks/useThis'
import useForceUpdate from '../hooks/useForceUpdate'

const injector = getInjector()

const useInjection = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  identification: number | string
): Readonly<T> => {
  const self = useThis()
  const forceUpdate = useForceUpdate()
  const compType = CompType.FUNCTION
  const liseners: Lisener[] = useMemo(
    () => [
      {
        forceUpdate,
        self,
        watchedProps: new Set<string>(),
        role: Role.COMPONENT,
        compType
      }
    ],
    [identification]
  )

  useEffect(() => injector.subscribe(InjectedStoreClass, liseners, compType, identification), [
    identification
  ])

  return useMemo(() => injector.get(InjectedStoreClass, liseners, identification), [identification])
}

export default useInjection
