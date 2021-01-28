import { getInjector } from '../core/Injector'

import StoreBase, { _meta } from './StoreBase'
import { Constructor } from '../types/store'
import { Payload, Lisener, Role, CompType } from '../types/StoreBase'
const injector = getInjector()

const injection = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  args?: Payload<T>
): any => (target: any, property: string): Readonly<any> => {
  const propertySymbol = Symbol(property)

  const clazz = InjectedStoreClass as any

  if (target instanceof clazz) {
    throw Error(`Injection decorator can't be use to self!`)
  }

  let liseners: Lisener[] = []

  return {
    enumerable: true,
    configurable: true,
    get(this: any): any {
      if (!this[propertySymbol]) {
        this[propertySymbol] = true

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

        const unsubscribe = injector.subscribe(clazz, args, liseners, compType)

        this.componentWillUnmount = (...args: any[]) => {
          unsubscribe?.()
          componentWillUnmount?.call(this, ...args)
        }
      }

      return injector.get(clazz, args, liseners)
    },
    set() {
      throw Error('Store is readonly!')
    }
  }
}

export default injection
