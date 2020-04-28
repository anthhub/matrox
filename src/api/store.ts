import 'reflect-metadata'
import StoreBase, { _meta } from './StoreBase'
import { Options, Scope, Constructor } from '../types/store'

export default <S extends Scope>(scope: S, options?: Options<S>) => <T extends StoreBase<T>>(
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
