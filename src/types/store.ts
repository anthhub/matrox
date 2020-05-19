import { MiddleWare } from './middleware'

export type Scope = 'application' | 'session'

export type Constructor<T> = new (...args: any[]) => T

export type PlainObject = {
  [propName: string]: any
}

export type GlobalOptions = {
  isSessionStore?: boolean
  middlewares?: MiddleWare[]
  persist?: boolean
}

export type StoreOptions = {
  ignoreMiddlewares?: MiddleWare[]
} & GlobalOptions

export type Options<T = any> = StoreOptions
