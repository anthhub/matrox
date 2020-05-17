import 'reflect-metadata'
import StoreBase, { _meta } from './StoreBase'
import { Options, Scope, Constructor } from '../types/store'
/**
 * config store
 *
 * @param  {S} scope store life scope
 * @param  {Options<S>} options? store options
 *
 * @example
 * ```ts
 * import { store, StoreBase, StoreBase} from 'matrox'
 *  @store('application', {})
 * class Store extends StoreBase<Store> {
 * }
 *
 * ```
 *
 * @see https://github.com/anthhub/matrox#store
 */
const store = <S extends Scope>(scope: S, options?: Options<S>) => <T extends StoreBase<T>>(
  target: Constructor<T>
): Constructor<T> => {
  const ignoredProps: string[] = []

  for (let key in target.prototype) {
    const ignoredProperty: string = Reflect.getMetadata('ignoredProperty', target.prototype, key)

    if (ignoredProperty) {
      ignoredProps.push(ignoredProperty)
    }
  }

  ;(target as any)[_meta] = { scope, options, ignoredProps }

  return target
}

export default store
