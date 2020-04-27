type OmitNever<T> = Pick<T, { [P in keyof T]: T[P] extends never ? never : P }[keyof T]>

type PickProps<T> = {
  [P in keyof T]: T[P] extends Function ? never : T[P]
}

type KVProps<T> = Partial<OmitNever<PickProps<T>>>

type Payload<T> = ((store: T) => KVProps<T>) | KVProps<T>

type Action<T, U> = { type: U; payload: Payload<T> }

type ActionFn<T, U> = (store: T) => { type: U; payload: Payload<T> }

type PropsAction<K extends keyof T, T> = {
  type: string
  payload: KVProps<T>
}

type Lisener = {
  forceUpdate: Function
  comp: any
  watchedProps: Set<string>
}

type Meta = {
  liseners: Lisener[]
  options: Options
  scope: Scope
  key: string
  storeName: string
}
