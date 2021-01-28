import { mergeOptions, collectDependences, genClassKey, getInitialValues } from './utils'
import StoreBase, { _meta, _updatePropsWithoutRender } from '../api/StoreBase'

import { Constructor } from '../types/store'
import { Payload, Lisener, KVProps, Meta, CompType } from '../types/StoreBase'
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
    arg: Payload<T> | undefined,
    liseners: Lisener[],
    compType: CompType
  ) {
    const instance = this.get(InjectedStoreClass, arg, liseners)

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
    args: Payload<T> = {},
    liseners: Lisener[]
  ): T {
    const { options: options1, ignoredProps = [] } = (InjectedStoreClass as any)[_meta] as Meta

    const options = mergeOptions(options1, globalOptions)

    let instance: T

    let container = this.appContainer

    const { key, className } = genClassKey(InjectedStoreClass)

    instance = container.get(key)

    if (!instance) {
      instance = new InjectedStoreClass(args)
      const initialValues = getInitialValues(instance)

      instance[_meta] = {
        ...instance[_meta],
        options,
        key,
        storeName: className,
        initialValues
      }

      let params: KVProps<T>
      if (typeof args === 'function') {
        params = args(instance)
      } else {
        params = args
      }

      instance[_updatePropsWithoutRender]({ ...params })

      if (options?.middlewares?.length) {
        applyMiddleware(...(options.middlewares || []))(instance)
      }

      container.set(key, instance)
    }

    const instanceProxy = collectDependences(instance, liseners, ignoredProps)

    return instanceProxy
  }
}
