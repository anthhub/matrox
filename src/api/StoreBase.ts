import {
  batchingUpdate,
  reduceUpdateObject,
  getEffectiveLiseners,
  updateTarget,
  compateAction,
  directUpdate
} from './StoreBaseUtils'
import { Action, Meta, ActionFn, Payload, KVProps } from '../types/StoreBase'

const _isBatchingUpdate = Symbol(`_isBatchingUpdate`)
const _actionsMergedQueue = Symbol(`_actionsMergedQueue`)
const _dispatchAction = Symbol(`_dispatchAction`)
const _mergeAction = Symbol(`_mergeAction`)
export const _updatePropsWithoutRender = Symbol(`_updatePropsWithoutRender`)

export const _meta = Symbol(`_meta`)
/**
 * store must extends StoreBase
 *
 * @example
 * ```ts
 * import { StoreBase } from 'matrox'
 * class Store extends StoreBase<Store> {
 * }
 *
 * ```
 *
 * @see https://github.com/anthhub/matrox#store
 */
export default abstract class StoreBase<T = {}, U extends string = string> {
  private [_isBatchingUpdate] = false

  private [_actionsMergedQueue]: Action<T, U | undefined>[] = []

  private [_meta]: Meta = {
    liseners: [],
    options: {},
    key: '',
    storeName: '',
    ignoredProps: [],
    initialValues: {}
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

  private [_mergeAction] = async () => {
    const self = (this as unknown) as T
    const propsMergedObject = this[_actionsMergedQueue].reduce(
      (res: KVProps<T>, cur: any, index: number) => {
        if (typeof cur === 'function') {
          cur = cur(this)
        }

        if (typeof cur.payload === 'function') {
          cur.payload = cur.payload(this)
        }

        const { payload, type } = compateAction(cur.payload, cur.type)

        if (typeof payload === 'function' && index !== 0) {
          this[_updatePropsWithoutRender](payload)
        }

        const rs = typeof payload === 'function' ? payload(self) : payload

        const payload1 = { ...res, ...rs }

        if (typeof payload === 'function' && index !== this[_actionsMergedQueue].length - 1) {
          this[_updatePropsWithoutRender](payload1)
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
    let updateObject: any

    updateObject = reduceUpdateObject(this, plainPayload)

    updateTarget((this as unknown) as T, updateObject)

    return updateObject
  }
  /**
   * force render all components or stores using this store
   *
   * @example
   * ```ts
   * store.forceUpdate()
   * ```
   *
   * @see https://github.com/anthhub/matrox#forceUpdate
   */
  forceUpdate = () => {
    return batchingUpdate(this[_meta].liseners)
  }
  /**
   *  directly force render all components or stores using this store
   *
   * @example
   * ```ts
   * store.forceUpdate()
   * ```
   *
   * @see https://github.com/anthhub/matrox#forceUpdateSync
   */
  forceUpdateSync = () => {
    return directUpdate(this[_meta].liseners)
  }
  /**
   * reset store properties and then render all components or stores using this store
   *
   * @example
   * ```ts
   * store.resetStore()
   * ```
   *
   * @see https://github.com/anthhub/matrox#resetStore
   */
  resetStore = () => {
    const initialValues: any = this[_meta].initialValues
    this[_updatePropsWithoutRender](initialValues)
    return directUpdate(this[_meta].liseners)
  }
  /**
   * merge action and batching update store or component using this store
   *
   * @param  {Payload<T>|Action<T} payload action or payload of action
   * @param  {U} type? type of action
   *
   * @example
   * ```ts
   * store.setProps({ name:'marry' })
   * ```
   *
   * @see https://github.com/anthhub/matrox#setProps
   */
  setProps = async (
    payload: Payload<T> | Action<T, U | undefined> | ActionFn<T, U | undefined>,
    type?: U
  ): Promise<void> => {
    this[_isBatchingUpdate] = true

    let action = compateAction(payload, type)

    this[_actionsMergedQueue].push(action)

    await Promise.resolve()

    if (!this[_isBatchingUpdate]) {
      return
    }
    this[_isBatchingUpdate] = false

    await this[_mergeAction]()
  }
}
