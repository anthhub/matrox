import StoreBase, { _meta } from './StoreBase'

export default <S extends Scope>(scope: S, options?: Options<S>) => <T extends StoreBase<T>>(
  target: Constructor<T>
): Constructor<T> => {
  ;(target as any)[_meta] = { scope, options }

  return target
}
