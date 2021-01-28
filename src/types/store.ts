import { MiddleWare } from './middleware'

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

export type Options = StoreOptions
