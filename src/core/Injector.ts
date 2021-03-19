import { mergeOptions, collectDependences, genClassKey, getProperties } from './utils'
import StoreBase, { _meta, _updatePropsWithoutRender } from '../api/StoreBase'

import { Constructor } from '../types/store'
import { Lisener, Meta, CompType } from '../types/StoreBase'
import { globalOptions } from '../api/globalConfig'
import applyMiddleware from './applyMiddleware'

let cachedInjector: Injector

export const getInjector = () => {
  return cachedInjector || (cachedInjector = Injector.newInstance())
}

class Injector {
  private readonly appContainer = new Map()

  static newInstance() {
    return new Injector()
  }

  clear() {
    this.appContainer.clear()
  }

  subscribe<T extends StoreBase<T>>(
    InjectedStoreClass: Constructor<T>,
    liseners: Lisener[],
    compType: CompType,
    identification: string | number = ''
  ) {
    const instance = this.get(InjectedStoreClass, liseners, identification)

    const instanceLiseners: Lisener[] = instance[_meta].liseners || []

    liseners.forEach(item => {
      if (!instanceLiseners.find(it => it.self === item.self)) {
        if (compType === CompType.FUNCTION) {
          instance[_meta].liseners = [...liseners, ...instanceLiseners]
        } else {
          instance[_meta].liseners = [...instanceLiseners, ...liseners]
        }
      }
    })

    return () => {
      instance[_meta].liseners = instance[_meta].liseners.filter(
        (item: any) => !liseners.find(it => it.forceUpdate === item.forceUpdate)
      )
    }
  }

  get<T extends StoreBase<T>>(
    InjectedStoreClass: Constructor<T>,
    liseners: Lisener[],
    identification: string | number = ''
  ): T {
    const { options: options1, ignoredProps = [] } = (InjectedStoreClass as any)[_meta] as Meta

    const options = mergeOptions(options1, globalOptions)

    let instance: T

    let container = this.appContainer

    const { key, className } = genClassKey(InjectedStoreClass, identification)

    instance = container.get(key)

    if (!instance) {
      instance = new InjectedStoreClass()
      const initialValues = getProperties(instance, [])

      instance[_meta] = {
        ...instance[_meta],
        options,
        ignoredProps,
        key,
        storeName: className,
        initialValues
      }

      if (options?.middlewares?.length) {
        applyMiddleware(...(options.middlewares || []))(instance)
      }

      container.set(key, instance)
    }

    const instanceProxy = collectDependences(instance, liseners, ignoredProps)

    return instanceProxy
  }
}
