import { MiddleWare } from './middleware'

export type Scope = 'application' | 'session'

export type Constructor<T> = new (...args: any[]) => T

export type PlainObject = {
  [propName: string]: any
}

export type GlobalOptions = {
  middlewares?: MiddleWare[]
  persist?: boolean
}

export type StoreOptions = {
  ignoreMiddlewares?: MiddleWare[]
} & GlobalOptions

export type ApplicationOptions = {
  persist?: boolean
} & StoreOptions

export type SessionOptions = {
  multiton?: boolean
} & StoreOptions

export type Options<T = Scope> = T extends 'session' ? SessionOptions : ApplicationOptions
