type Scope = 'application' | 'session'

type Constructor<T> = new (...args: any[]) => T

type PlainObject = {
  [propName: string]: any
}

type GlobalOptions<> = {
  middlewares?: MiddleWare[]
}

type StoreOptions = {
  ignoreMiddlewares?: MiddleWare[]
} & GlobalOptions

type ApplicationOptions = {
  persist?: boolean
} & StoreOptions

type SessionOptions = {
  multiton?: boolean
} & StoreOptions

type Options<T = Scope> = T extends 'session' ? SessionOptions : ApplicationOptions
