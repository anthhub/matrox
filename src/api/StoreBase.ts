import {
  batchingUpdate,
  forceUpdate,
  reduceUpdateObject,
  getEffectiveLiseners,
  updateTarget,
  compateAction
} from './StoreBaseUtils'
import { Action, Meta, ActionFn, Payload, KVProps } from '../types/StoreBase'

const _isBatchingUpdate = Symbol(`_isBatchingUpdate`)
const _actionsMergedQueue = Symbol(`_actionsMergedQueue`)
const _dispatchAction = Symbol(`_dispatchAction`)
const _mergeAction = Symbol(`_mergeAction`)
export const _updatePropsWithoutRender = Symbol(`_updatePropsWithoutRender`)

export const _meta = Symbol(`_meta`)

export default abstract class StoreBase<T = {}, U extends string = string> {
  private [_isBatchingUpdate] = false

  private [_actionsMergedQueue]: Action<T, U | undefined>[] = []

  private [_meta]: Meta = {
    liseners: [],
    options: {},
    scope: 'application',
    key: '',
    storeName: '',
    ignoredProps: []
  }

  private [_dispatchAction] = async (
    action: Action<T, U | undefined> | ActionFn<T, U | undefined>,
    model: 'bactching' | 'force' = 'bactching'
  ) => {
    if (typeof action === 'function') {
      action = action(this as any)
    }
    const { payload } = action
    const updateObject = this[_updatePropsWithoutRender](payload)

    if (model === 'force') {
      return forceUpdate(getEffectiveLiseners(this[_meta].liseners, updateObject))
    } else {
      return batchingUpdate(getEffectiveLiseners(this[_meta].liseners, updateObject))
    }
  }

  private [_mergeAction] = async () => {
    const self = (this as unknown) as T
    const propsMergedObject = this[_actionsMergedQueue].reduce(
      (
        res: KVProps<T>,
        cur: Action<T, U | undefined> | ActionFn<T, U | undefined>,
        index: number
      ) => {
        if (typeof cur === 'function') {
          cur = cur(this as any)
        }

        const { payload, type } = compateAction(cur.payload, cur.type)

        if (typeof payload === 'function' && index !== 0) {
          this[_dispatchAction]({ payload: res, type })
        }

        const rs = typeof payload === 'function' ? payload(self) : payload

        const payload1 = { ...res, ...rs }

        if (typeof payload === 'function' && index !== this[_actionsMergedQueue].length - 1) {
          this[_dispatchAction]({ payload: payload1, type })
        }
        return payload1
      },
      {}
    )
    this[_actionsMergedQueue] = []

    await this[_dispatchAction]({ payload: propsMergedObject, type: undefined })
  }

  private [_updatePropsWithoutRender] = (payload: Payload<T>): KVProps<T> => {
    const self = (this as unknown) as T
    const plainPayload = typeof payload === 'function' ? payload(self) : payload
    const updateObject = reduceUpdateObject(this, plainPayload)

    updateTarget((this as unknown) as T, updateObject)

    return updateObject
  }

  setPropsForce = (payload: Payload<T>, type?: U) => {
    return this[_dispatchAction]({ payload, type }, 'force')
  }

  setProps = async (
    payload: Payload<T> | Action<T, U | undefined> | ActionFn<T, U | undefined>,
    type?: U
  ): Promise<void> => {
    this[_isBatchingUpdate] = true

    let action = compateAction(payload, type)

    this[_actionsMergedQueue].push(action)

    return Promise.resolve().then(() => {
      if (!this[_isBatchingUpdate]) {
        return
      }
      this[_isBatchingUpdate] = false

      this[_mergeAction]()
    })
  }
}
