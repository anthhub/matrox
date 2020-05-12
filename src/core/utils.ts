import StoreBase, { _meta } from '../api/StoreBase'
import persist from '../middleware/persist'
import { Constructor, Scope, Options, GlobalOptions } from '../types/store'
import { Lisener } from '../types/StoreBase'

export const getUrlRelativePath = () => {
  const url = document.location.toString()
  const arrUrl = url.split('//')

  const start = arrUrl[1].indexOf('/')
  let relUrl = arrUrl[1].substring(start)

  if (relUrl.indexOf('?') !== -1) {
    relUrl = relUrl.split('?')[0]
  }
  return relUrl
}

export const hashCode = (str: string) => {
  if (Array.prototype.reduce) {
    return str.split('').reduce(function(a, b) {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
  }
  let hash = 0
  if (str.length === 0) return hash
  for (let i = 0; i < str.length; i++) {
    const character = str.charCodeAt(i)
    hash = (hash << 5) - hash + character
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

export const getClassName = (clazz: Constructor<any>) => {
  const classStr = clazz.toString()

  const [, name1] = classStr.match(/class\s+(\w+).*{/) || []

  const [, name2] = classStr.match(/function\s+([^(]*)\(/) || []

  return name1 || name2 || ''
}

export const genClassKey = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  identification?: string
) => {
  const keyPrefix = hashCode('mobx-injection')

  const scope: Scope = (InjectedStoreClass as any)[_meta]?.scope

  const curPath = identification || getUrlRelativePath()

  const className = getClassName(InjectedStoreClass)

  const keyPostfix = scope === 'session' ? curPath : ''

  const classHaseCode = hashCode(InjectedStoreClass.toString().slice(0, 100))

  const key = `${keyPrefix}@${className}@${classHaseCode}@${keyPostfix}`

  return { key, className, classHaseCode, keyPostfix, keyPrefix }
}

export const mergeOptions = (options: Options, globalOptions: GlobalOptions) => {
  const newOptions = { ...globalOptions, ...options }

  newOptions.middlewares = [
    ...new Set([...(globalOptions?.middlewares || []), ...(options?.middlewares || [])])
  ]

  if (newOptions?.persist && !newOptions?.middlewares?.includes(persist)) {
    newOptions?.middlewares?.unshift(persist)
  }

  if (options?.ignoreMiddlewares?.length) {
    newOptions.middlewares = newOptions.middlewares?.filter(
      item => !options?.ignoreMiddlewares?.includes(item)
    )
  }

  return newOptions
}

export const collectDependences = <T extends StoreBase<T>>(
  instance: T,
  liseners: Lisener[],
  ignoredProps: string[] = []
): T => {
  return new Proxy(instance, {
    get(target, key: string | symbol) {
      const result = (target as any)[key]

      if (typeof key !== 'symbol' && typeof result !== 'function' && !ignoredProps.includes(key)) {
        liseners.forEach(item => {
          item.watchedProps.add(key)
        })
      }

      return result
    },
    set(target, key, value) {
      if (typeof key === 'symbol') {
        return Reflect.set(target, key, value)
      }
      throw Error('store property to be readonly!')
    }
  })
}
