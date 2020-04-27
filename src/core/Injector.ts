import { genStoreKey, mergeOptions, collectDependence } from './utils'
import StoreBase, { _meta } from '../api/StoreBase'

import applyMiddleware from '../middleware/applyMiddleware'

let cachedInjector: Injector

export const getInjector = () => {
  return cachedInjector || (cachedInjector = Injector.newInstance())
}

class Injector {
  private readonly appContainer = new Map()

  private readonly sessContainer = new Map()

  static newInstance() {
    return new Injector()
  }

  subscribe<T extends StoreBase<T>>(
    InjectedStoreClass: Constructor<T>,
    arg: Payload<T> | undefined,
    liseners: Lisener[],
    compType: 'decorator' | 'hooks'
  ) {
    const instance = this.get(InjectedStoreClass, arg, liseners)

    const instanceLiseners: any[] = instance[_meta].liseners || []

    liseners.forEach(item => {
      if (!instanceLiseners.find((it: any) => it.comp === item.comp)) {
        if (compType === 'hooks') {
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
      if (!instance[_meta].liseners.length) {
        const key = instance[_meta].key
        this.sessContainer.get(key)?.componentWillUnmount?.()
        this.sessContainer.delete(key)
      }
    }
  }

  get<T extends StoreBase<T>>(
    InjectedStoreClass: Constructor<T>,
    args: Payload<T> = {},
    liseners: Lisener[],
    identify?: any
  ): T {
    const { scope, options: options1 } = (InjectedStoreClass as any)[_meta]

    const options = mergeOptions(options1)

    let instance: T

    let container = scope === 'session' ? this.sessContainer : this.appContainer

    const { key: classKey, className: storeName } = genStoreKey(
      InjectedStoreClass,
      String(identify || '')
    )

    const key = classKey

    instance = container.get(key)

    if (!instance) {
      // clser session
      if (scope === 'session' && !(options as SessionOptions).multiton) {
        ;[...(this.sessContainer.keys() as any)].forEach(async key => {
          if (!new RegExp(`^${key}$`).test(key)) {
            this.sessContainer.get(key)?.componentWillUnmount?.()
            this.sessContainer.delete(key)
          }
        })
      }

      instance = new InjectedStoreClass(args)

      instance[_meta] = {
        liseners: [],
        ...instance[_meta],
        options,
        scope,
        key,
        storeName
      }

      let params: KVProps<T>
      if (typeof args === 'function') {
        params = args(instance)
      } else {
        params = args
      }

      instance.updatePropsWithoutRender({ ...params })

      if (options?.middlewares?.length) {
        applyMiddleware(...(options.middlewares || []))(instance)
      }

      const instanceProxy = collectDependence(instance, liseners)

      container.set(key, instanceProxy)

      return instanceProxy
    }

    return instance
  }
}
