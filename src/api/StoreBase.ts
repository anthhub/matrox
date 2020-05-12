import {
  batchingUpdate,
  forceUpdate,
  reduceUpdateObject,
  getEffectiveLiseners,
  updateTarget,
  compateAction
} from './StoreBaseUtils'
import { Action, Meta, ActionFn, Payload, KVProps } from '../types/StoreBase'

const _dispatchAction = Symbol(`_dispatchAction`)
export const _updatePropsWithoutRender = Symbol(`_updatePropsWithoutRender`)

export const _meta = Symbol(`_meta`)

export default abstract class StoreBase<T = {}, U extends string = string> {
  private [_meta]: Meta = {
    liseners: [],
    options: {},
    scope: 'application',
    key: '',
    storeName: '',
    ignoredProps: []
  }

  private [_dispatchAction] = async (
    action: Action<T, U | undefined> | ActionFn<T, U | undefined>
  ) => {
    if (typeof action === 'function') {
      action = action(this as any)
    }

    if (typeof action.payload === 'function') {
      action.payload = action.payload(this as any)
    }

    const { payload, type } = compateAction(action.payload, action.type)

    const updateObject = this[_updatePropsWithoutRender](payload)

    return batchingUpdate(getEffectiveLiseners(this[_meta].liseners, updateObject))
  }

  private [_updatePropsWithoutRender] = (payload: Payload<T>): KVProps<T> => {
    const self = (this as unknown) as T
    const plainPayload = typeof payload === 'function' ? payload(self) : payload
    let updateObject: any

    updateObject = reduceUpdateObject(this, plainPayload)

    updateTarget((this as unknown) as T, updateObject)

    return updateObject
  }

  forceUpdate = () => {
    return forceUpdate(this[_meta].liseners)
  }

  setProps = (
    payload: Payload<T> | Action<T, U | undefined> | ActionFn<T, U | undefined>,
    type?: U
  ) => {
    let action = compateAction(payload, type)
    return this[_dispatchAction](action)
  }
}
