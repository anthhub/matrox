import { getInjector } from '../core/Injector'

import StoreBase, { _meta } from './StoreBase'
import { Constructor } from '../types/store'
import { Payload, Lisener, Role, CompType } from '../types/StoreBase'
import { logError } from '../core/utils'
const injector = getInjector()

const injection = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  args?: Payload<T>,
  identification: number | string = ''
): any => (target: any, property: string): Readonly<any> => {
  const propertySymbol = Symbol(property)

  const clazz = InjectedStoreClass as any

  if (target instanceof clazz) {
    logError(`injection decorator can't be use to self!`)
  }

  let liseners: Lisener[] = []

  return {
    enumerable: true,
    configurable: true,
    get(this: any): any {
      if (!this[propertySymbol]) {
        const forceUpdate = this.forceUpdate?.bind(this)
        const role = this instanceof StoreBase ? Role.STORE : Role.COMPONENT
        const compType = CompType.CLASS
        liseners = [
          {
            forceUpdate,
            self: this,
            watchedProps: new Set<string>(),
            role,
            compType
          }
        ]

        const componentWillUnmount = this.componentWillUnmount

        const unsubscribe = injector.subscribe(clazz, args, liseners, compType, identification)

        this.componentWillUnmount = (...args: any[]) => {
          unsubscribe?.()
          componentWillUnmount?.call(this, ...args)
        }

        this[propertySymbol] = injector.get(clazz, args, liseners, identification)
      }

      return this[propertySymbol]
    },
    set() {
      logError('store is readonly.')
    }
  }
}

export default injection
