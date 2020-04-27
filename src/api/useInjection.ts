/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

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
  identify?: any
): Readonly<T> => {
  const comp = useThis(args)
  const forceUpdate = useForceUpdate()

  const liseners = useMemo(() => [{ forceUpdate, comp, watchedProps: new Set<string>() }], [])

  useEffect(() => injector.subscribe(InjectedStoreClass, args, liseners, `hooks`), [])

  return useMemo(() => injector.get(InjectedStoreClass, args, liseners, identify), [])
}

export default useInjection
