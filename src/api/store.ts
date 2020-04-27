import StoreBase, { _meta } from './StoreBase'
import { Scope, Options, Constructor } from '../types/store'

const store = <S extends Scope>(scope: S, options?: Options<S>) => <T extends StoreBase<T>>(
  target: Constructor<T>
): Constructor<T> => {
  ;(target as any)[_meta] = { scope, options }

  return target
}

export default store
