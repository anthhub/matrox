import { Lisener, KVProps } from '../types/StoreBase'

import { PlainObject } from '../types/store'

let allLiseners: Lisener[] = []

let isBatchingUpdate = false

export const batchingUpdate = (liseners: Lisener[]) => {
  isBatchingUpdate = true

  liseners.forEach(item => {
    if (!allLiseners.find(it => it.comp === item.comp) && item.forceUpdate) {
      allLiseners.push(item)
    }
  })

  return Promise.resolve().then(() => {
    if (!isBatchingUpdate) {
      return
    }
    isBatchingUpdate = false
    allLiseners.forEach(item => item?.forceUpdate?.())
    allLiseners = []
  })
}

export const forceUpdate = (liseners: Lisener[]) => {
  liseners.forEach(item => item?.forceUpdate?.())
}

export const getEffectiveLiseners = <T extends PlainObject>(
  liseners: Lisener[],
  updateObject: KVProps<T>
) => {
  const effectiveLiseners = liseners.filter(item =>
    [...((item.watchedProps as unknown) as string[])].some((it: string) =>
      Object.keys(updateObject).includes(it)
    )
  )
  return effectiveLiseners
}

export const reduceUpdateObject = <T extends PlainObject, U extends PlainObject>(
  target: T,
  updateObject: U
): U => {
  console.log(' updateObject', updateObject)

  return Object.keys(updateObject).reduce((res: any, key) => {
    if (target[key] === undefined) {
      console.log(target[key])
      throw Error(`target don't exist the '${key}', please define it before using`)
    }

    if (typeof updateObject[key] !== typeof target[key]) {
      throw Error(
        `${updateObject[key]} can't assign to ${key} since the type of ${key} is ${typeof target[
          key
        ]} instead of ${typeof updateObject[key]}`
      )
    }

    if (updateObject[key] !== target[key]) {
      res[key] = updateObject[key]
    }
    return res
  }, {})
}

export const updateTarget = <T extends PlainObject>(target: T, updateObject: KVProps<T>) => {
  Object.keys(updateObject).forEach(key => {
    const value = (updateObject as any)[key]
    if (!key) {
      throw new Error('Unuseful object!')
    }
    if (typeof value === 'function') {
      if (process.env.NODE_ENV === 'production') {
        return
      } else {
        throw new Error('Forbid reseting method member of class!')
      }
    }

    Reflect.set(target, key, value)
  })
}

export const compateAction = (payload: any, type?: string) => {
  // 函数的情况 可能是action 和 payload
  if (typeof payload === 'function') {
    return { payload, type }
  }
  // 一定是action
  if (payload.type !== undefined && payload.payload !== undefined) {
    return payload
  }
  // payload 的情况
  return { payload, type }
}
