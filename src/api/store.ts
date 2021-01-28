import 'reflect-metadata'
import StoreBase, { _meta } from './StoreBase'
import { Options, Constructor } from '../types/store'
/**
 * config store
 *
 * @param  {Options<S>} options? store options
 *
 * @example
 * ```ts
 * import { store, StoreBase } from 'matrox'
 * `＠`store()
 * class Store extends StoreBase<Store> {
 * }
 *
 * ```
 *
 * @see https://github.com/anthhub/matrox#store
 */
const store = (options?: Options) => <T extends StoreBase<T>>(target: Constructor<T>) => {
  const ignoredProps: string[] = []

  for (let key in target.prototype) {
    const ignoredProperty: string = Reflect.getMetadata('ignoredProperty', target.prototype, key)

    if (ignoredProperty) {
      ignoredProps.push(ignoredProperty)
    }
  }

  ;(target as any)[_meta] = { options, ignoredProps }

  return target
}

export default store
