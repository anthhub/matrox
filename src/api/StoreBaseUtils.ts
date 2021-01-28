import { Lisener, KVProps, Role } from '../types/StoreBase'

import { PlainObject } from '../types/store'
import { _meta } from './StoreBase'
import { logError } from '../core/utils'

let allLiseners: Lisener[] = []
let isBatchingUpdate = false

export const reduceLisners = (liseners: Lisener[], reducedLiseners: Lisener[]) => {
  const tmpLisener = [...reducedLiseners]

  liseners
    .map(item => (item.role === Role.STORE ? item.self[_meta]?.liseners || [] : item))
    .flat(1)
    .forEach((item: Lisener) => {
      if (!tmpLisener.find(it => it.self === item.self) && item.forceUpdate) {
        tmpLisener.push(item)
      }
    })

  return tmpLisener
}

export const directUpdate = (liseners: Lisener[]) => {
  allLiseners = reduceLisners(liseners, allLiseners)
  walkUpdate()
}

export const batchingUpdate = async (liseners: Lisener[]) => {
  isBatchingUpdate = true

  allLiseners = reduceLisners(liseners, allLiseners)

  await Promise.resolve()

  if (!isBatchingUpdate) {
    return
  }
  isBatchingUpdate = false
  walkUpdate()
}

function walkUpdate() {
  allLiseners.forEach(item => item?.forceUpdate?.())
  allLiseners = []
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
  return Object.keys(updateObject).reduce((res: any, key) => {
    if (target[key] === undefined) {
      logError(`Matrox: Target don't exist the '${key}', please define it before using.`)
      return
    }

    if (typeof updateObject[key] !== typeof target[key]) {
      logError(
        `Matrox: expected ${typeof target[key]} but ${typeof updateObject[key]} in field ${key}.`
      )
      return
    }

    if (updateObject[key] !== target[key]) {
      res[key] = updateObject[key]
    }
    return res
  }, {})
}

export const updateTarget = <T extends PlainObject>(target: T, updateObject: KVProps<T>) => {
  Object.keys(updateObject).forEach(key => {
    if (!key) {
      throw new Error('Unuseful object!')
    }
    const value = (updateObject as any)[key]

    if (typeof value === 'function') {
      logError(`Matrox: Forbid reset method of class.`)
      return
    }

    Reflect.set(target, key, value)
  })
}

export const compateAction = (payload: any, type?: string) => {
  // payload is "action" or "payload"
  if (typeof payload === 'function') {
    return { payload, type }
  }
  // payload is "action"
  if (payload.type !== undefined && payload.payload !== undefined) {
    return payload
  }
  // payload is "payload"
  return { payload, type }
}
