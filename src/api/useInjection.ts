/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo, useRef, useCallback, useState } from 'react'

import { getInjector } from '../core/Injector'

import StoreBase from './StoreBase'
import { Constructor } from '../types/store'
import { Payload } from '../types/StoreBase'

const injector = getInjector()

const useThis = (args: any) => {
  const comp = useRef({ args })

  return comp.current
}

const useForceUpdate = () => {
  const [, _forceUpdate] = useState(0)
  return useCallback(() => _forceUpdate(n => n + 1), [])
}

const useInjection = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  args?: Payload<T>,
  identification?: number | string
): Readonly<T> => {
  const comp = useThis(args)
  const forceUpdate = useForceUpdate()

  const liseners = useMemo(() => [{ forceUpdate, comp, watchedProps: new Set<string>() }], [])

  useEffect(() => injector.subscribe(InjectedStoreClass, args, liseners, `hooks`), [])

  return injector.get(InjectedStoreClass, args, liseners, identification)
}

export default useInjection
