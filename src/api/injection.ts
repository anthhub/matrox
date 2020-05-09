import { getInjector } from '../core/Injector'

import StoreBase, { _meta } from './StoreBase'
import { Constructor } from '../types/store'
import { Payload } from '../types/StoreBase'
const injector = getInjector()

const injection = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  args?: Payload<T>,
  identification?: number | string
): any => (target: any, property: string): Readonly<any> => {
  const propertySymbol = Symbol(property)

  const clazz = InjectedStoreClass as any

  if (target instanceof clazz) {
    throw Error(`injection decorator can't be use to self!`)
  }

  return {
    enumerable: true,
    configurable: true,
    get(this: any): any {
      let liseners: any[] = []

      if (!this[propertySymbol]) {
        this[propertySymbol] = true

        const forceUpdate = this.forceUpdate?.bind(this)

        liseners = this[_meta]?.liseners || [
          { forceUpdate, comp: this, watchedProps: new Set<string>() }
        ]

        const componentWillUnmount = this.componentWillUnmount

        const unsubscribe = injector.subscribe(clazz, args, liseners, `decorator`)

        this.componentWillUnmount = (...args: any[]) => {
          unsubscribe?.()
          componentWillUnmount?.call(this, ...args)
        }
      }

      return injector.get(clazz, args, liseners, identification)
    },
    set() {
      throw Error('store is readonly!')
    }
  }
}

export default injection
