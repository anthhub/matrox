/* eslint-disable react-hooks/rules-of-hooks */

import getInjection from './getInjection'

import StoreBase from './StoreBase'

const preLoad = <T extends StoreBase<T>, U extends Payload<T>>(
  InjectedStoreClass: Constructor<T>,
  args?: U
) => {
  getInjection(InjectedStoreClass, args)
}

export default preLoad
