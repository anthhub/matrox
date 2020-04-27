// import 'reflect-metadata'

import { getInjector } from '../core/Injector'

import StoreBase, { _meta } from './StoreBase'
import { Constructor } from '../types/store'
import { Payload } from '../types/StoreBase'
const injector = getInjector()

const injection = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  args?: Payload<T>,
  identify?: any
): any => (target: any, property: string): Readonly<any> => {
  const propertySymbol = Symbol(property)

  // if (!InjectedStoreClass) {
  //   InjectedStoreClass = Reflect.getMetadata('design:type', target, property)
  //   if (!InjectedStoreClass) {
  //     throw new SyntaxError(
  //       `You must pass a Class for injection while you are not using typescript! Or you may need to add "emitDecoratorMetadata: true" configuration to your tsconfig.json`
  //     )
  //   }
  // }

  const clazz = InjectedStoreClass as any

  if (target instanceof clazz) {
    throw Error(`injection decorator can't be use to self!`)
  }

  return {
    enumerable: true,
    configurable: true,
    get(this: any): any {
      if (!this[propertySymbol]) {
        const forceUpdate = this.forceUpdate?.bind(this)

        const liseners = this[_meta]?.liseners || [
          { forceUpdate, comp: this, watchedProps: new Set<string>() }
        ]

        const componentWillUnmount = this.componentWillUnmount

        const unsubscribe = injector.subscribe(clazz, args, liseners, `decorator`)

        this.componentWillUnmount = (...args: any[]) => {
          unsubscribe?.()
          componentWillUnmount?.call(this, ...args)
        }

        this[propertySymbol] = injector.get(clazz, args, liseners, identify)
      }
      return this[propertySymbol]
    },
    set() {
      throw Error('store is readonly!')
    }
  }
}

export default injection
