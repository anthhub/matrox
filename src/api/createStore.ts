import getInjection from './getInjection'
import StoreBase from './StoreBase'
import useInjection from './useInjection'
import injection from './injection'
import { Payload } from '../types/StoreBase'
import { Constructor, StoreOptions } from '../types/store'
import store from './store'

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
const createStore = <T extends StoreBase<T>, U extends Payload<T>>(
  InjectedStoreClass: Constructor<T>,
  options: StoreOptions = {}
) => {
  InjectedStoreClass = store(options)(InjectedStoreClass)

  /**
   * get a store for function component
   *
   * @param  {U} args? initial argument
   *
   * @example
   * const Comp: React.FC = () => {
   * const store = useStore()
   * return <div/>
   * }
   *
   * @see https://github.com/anthhub/matrox#useStore
   */
  const useStore = (args?: U) => useInjection(InjectedStoreClass, args)

  /**
   * get a store for class component
   *
   * @param  {U} args? initial argument
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
  const injectStore = (args?: U) => injection(InjectedStoreClass, args)

  /**
   * get a store just for application store at outside of component, session store will return undefind
   *
   * @param  {U} args? initial argument
   *
   * @example
   * const store = getStore()
   *
   * @see https://github.com/anthhub/matrox#getStore
   */
  const getStore = (args?: U) => getInjection(InjectedStoreClass, args)

  /**
   * preload a store just for application store
   *
   * @param  {U} args? initial argument
   *
   * @example
   * const store = getStore()
   *
   * @see https://github.com/anthhub/matrox#preloadStore
   */
  const preloadStore = (args?: U) => {
    getStore(args)
  }

  /**
   * get plain state object of store just for application one
   *
   * @param  {U} args? initial argument
   *
   * @example
   * const store = getStore()
   *
   * @see https://github.com/anthhub/matrox#getState
   */
  const getState = () => {
    return JSON.parse(JSON.stringify(getStore() || {}))
  }

  return { useStore, injectStore, getStore, preloadStore, getState }
}

export default createStore
