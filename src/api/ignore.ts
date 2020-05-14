import 'reflect-metadata'
/**
 * ignore property decorator ignore store fields to avoid trigger render when change it
 *
 * @example
 * ```ts
 * import { store, StoreBase, StoreBase, ignore} from 'matrox'
 *  @store('application', {})
 * class Store extends StoreBase<Store> {
 * @ignore name = 'Jack'
 * }
 *
 * ```
 *
 * @see https://github.com/anthhub/matrox#ignore
 */
const ignore = (target: any, key: string): any => {
  Reflect.defineMetadata('ignoredProperty', key, target, key)

  let _val = target[key]

  if (delete target[key]) {
    // 创建新属性及其读取访问器、写入访问器
    Object.defineProperty(target, key, {
      get: () => {
        return _val
      },
      set: (newVal: string) => {
        _val = newVal
      },
      enumerable: true,
      configurable: true
    })
  }
}

export default ignore
