import 'reflect-metadata'

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
