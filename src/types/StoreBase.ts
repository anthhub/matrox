import { Options, PlainObject } from './store'

export type OmitNever<T> = Pick<T, { [P in keyof T]: T[P] extends never ? never : P }[keyof T]>

export type PickProps<T> = {
  [P in keyof T]: T[P] extends Function ? never : T[P]
}

export type KVProps<T> = Partial<OmitNever<PickProps<T>>>

export type Payload<T> = ((store: T) => KVProps<T>) | KVProps<T>

export type Action<T, U> = { type: U; payload: Payload<T> }

export type ActionFn<T, U> = (store: T) => { type: U; payload: Payload<T> }

export type PropsAction<K extends keyof T, T> = {
  type: string
  payload: KVProps<T>
}

export enum Role {
  STORE = 'STORE',
  COMPONENT = 'COMPONENT'
}

export enum CompType {
  FUNCTION = 'FUNCTION',
  CLASS = 'CLASS'
}

export type Lisener = {
  forceUpdate: Function
  self: any
  watchedProps: Set<string>
  compType: CompType
  role: Role
}

export type Meta = {
  liseners: Lisener[]
  options: Options
  key: string
  storeName: string
  ignoredProps: string[]
  initialValues: PlainObject
}
