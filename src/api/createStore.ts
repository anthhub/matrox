import getInjection from './getInjection'
import StoreBase, { _meta } from './StoreBase'
import useInjection from './useInjection'
import injection from './injection'
import { Constructor, StoreOptions } from '../types/store'
import store from './store'
import { getProperties } from '../core/utils'

/**
 * create a store and return `useStore, injectStore, getStore, preloadStore, getState`
 *
 * @param  {Constructor<T>} InjectedStoreClass store class
 *
 * @example
 * ```ts
 * import { createStore} from 'matrox'
 *
 * const { useStore, injectStore, getStore, preloadStore, getState } = createStore(Store)
 * ```
 *
 * @see https://github.com/anthhub/matrox#createStore
 */
const createStore = <T extends StoreBase<T>>(
  InjectedStoreClass: Constructor<T>,
  options: StoreOptions = {}
) => {
  InjectedStoreClass = store(options)(InjectedStoreClass)

  /**
   * get a store for function component
   *
   * @param  identification? identification of reference store
   *
   * @example
   * const Comp: React.FC = () => {
   * const store = useStore()
   * return <div/>
   * }
   *
   * @see https://github.com/anthhub/matrox#useStore
   */
  const useStore = (identification: number | string = '') =>
    useInjection(InjectedStoreClass, identification)

  /**
   * get a store for class component
   *
   * @param  identification? identification of reference store
   *
   * @example
   * class Comp extends React.Component{
   * `@`injectStore()
   * store: Readonly<Store>
   *  render(){
   *  return <div/>
   *  }
   * }
   *
   * @see https://github.com/anthhub/matrox#injectStore
   */
  const injectStore = (identification: number | string = '') =>
    injection(InjectedStoreClass, identification)

  /**
   * get a store just for application store at outside of component, session store will return undefind
   *
   * @param  identification? identification of reference store
   *
   * @example
   * const store = getStore()
   *
   * @see https://github.com/anthhub/matrox#getStore
   */
  const getStore = (identification: number | string = '') =>
    getInjection(InjectedStoreClass, identification)

  /**
   * preload a store just for application store
   *
   * @param  identification? identification of reference store
   *
   * @example
   * const store = getStore()
   *
   * @see https://github.com/anthhub/matrox#preloadStore
   */
  const preloadStore = (identification: number | string = '') => {
    getStore(identification)
  }

  /**
   * get plain state object of store just for application one
   *
   * @param  identification? identification of reference store
   *
   * @example
   * const store = getStore()
   *
   * @see https://github.com/anthhub/matrox#getState
   */
  const getState = (identification: number | string = '') => {
    const store: T | undefined = getStore(identification)
    if (!store) {
      return {}
    }
    return store.getState()
  }

  return { useStore, injectStore, getStore, preloadStore, getState }
}

export default createStore
