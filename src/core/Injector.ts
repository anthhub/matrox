import { mergeOptions, collectDependences, genClassKey } from './utils'
import StoreBase, { _meta, _updatePropsWithoutRender } from '../api/StoreBase'

import applyMiddleware from '../middleware/applyMiddleware'
import { Constructor, SessionOptions } from '../types/store'
import { Payload, Lisener, KVProps, Meta } from '../types/StoreBase'
import { globalOptions } from '../api/config'

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

  clear() {
    this.appContainer.clear()
    this.sessContainer.clear()
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
    identification?: string | number
  ): T {
    const { scope, options: options1, ignoredProps = [] } = (InjectedStoreClass as any)[
      _meta
    ] as Meta

    const options = mergeOptions(options1, globalOptions)

    let instance: T

    let container = scope === 'session' ? this.sessContainer : this.appContainer

    const { key: classKey, className, keyPrefix, classHaseCode } = genClassKey(
      InjectedStoreClass,
      String(identification || '')
    )

    const key = classKey

    instance = container.get(key)

    if (!instance) {
      // clser session
      if (scope === 'session' && !(options as SessionOptions).multiton) {
        ;[...(this.sessContainer.keys() as any)].forEach(key => {
          if (new RegExp(`^${keyPrefix}@${className}@${classHaseCode}@.*$`).test(key)) {
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
        storeName: className
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
