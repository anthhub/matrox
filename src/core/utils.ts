import StoreBase, { _meta } from '../api/StoreBase'
import persist from '../middleware/persist'
import { Constructor, Options, GlobalOptions, PlainObject } from '../types/store'
import { Lisener } from '../types/StoreBase'

export const hashCode = (str: string) => {
  return str.split('').reduce(function(a, b) {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
}

export const getClassName = (clazz: Constructor<any>) => {
  const classStr = clazz.toString()

  const [, name1] = classStr.match(/class\s+(\w+).*{/) || []

  const [, name2] = classStr.match(/function\s+([^(]*)\(/) || []

  return name1 || name2 || ''
}

export const genClassKey = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  identification: string | number = ''
) => {
  const keyPrefix = 'MATROX'

  const className = getClassName(InjectedStoreClass)

  const classHaseCode = hashCode(InjectedStoreClass.toString())

  const key = `${keyPrefix}@${className}@${classHaseCode}@${identification}`

  return { key, className, classHaseCode, keyPrefix }
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
    get(target: any, key: string | symbol) {
      const result = target[key]
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
      logError('store property is readonly.')
      return false
    }
  })
}

export const getProperties = <T extends PlainObject>(target: T, ignoredProps: string[]): T => {
  return Object.keys(target).reduce((res: any, key) => {
    const result = target[key]

    if (result === undefined) {
      logError(`please define "${key}" before using.`)
      return
    }
    // tslint:disable-next-line: strict-type-predicates
    if (!ignoredProps.includes(key) && typeof key !== 'symbol' && typeof result !== 'function') {
      res[key] = result
    }
    return res
  }, {})
}

export const logError = (msg: string) => {
  const message = 'Matrox: ' + msg
  if (process.env.NODE_ENV === 'production') {
    console.error(message)
  } else {
    throw Error(message)
  }
}
