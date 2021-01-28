# [Matrox](https://www.npmjs.com/package/matrox)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebook/react/blob/master/LICENSE)
[![Build Status](https://travis-ci.com/anthhub/matrox.svg?branch=master&status=passed)](https://travis-ci.com/github/anthhub/matrox)
[![Coverage Status](https://coveralls.io/repos/github/anthhub/matrox/badge.svg?branch=master)](https://coveralls.io/github/anthhub/matrox?branch=master)

## 特性

- 两个 API, 符合直觉, 几乎无需学习成本
- 支持类 redux 中间件, 方便拓展
- 支持类 mobx 依赖收集, 类 react action 合并和批量更新, 优化性能
- 支持预加载和持久化
- 完美的 TypeScript 支持
- 支持多数据源, matrox => matrix
- 支持 function 和 class 组件

## 在线体验

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-with-matrox-forked-w732m?file=/src/App.tsx)

## 安装

```bash
yarn add matrox
npm install --save matrox
```

## 快速上手

### 创建一个 store

`matrox` 的 store 用法和 `mobx` 比较类似, 使用 class 形式继承 <a name="StoreBase">`StoreBase`</a>, 则 store 实例拥有的 `setProps` 方法来改变状态. 和 `react` 类似, 只有通过 <a name="setProps">`setProps`</a> 才能触发更新, 即单向数据流, 直接修改实例属性是不允许的. `setProps` 也可以接受 `plain onject`,和 返回 `plain object`的`callback`(就像 `setState` 那样), 并有完善的类型推断.

> `注意:setProps` 返回 `Promise` 也是异步更新的, 会合并多个 `action`, 并且多个 store 的多个 `setProps` 也会合并在某个时机一起更新.

通过 <a name="createStore">`createStore`</a> 可以把 store class 生成 hooks -- <a name="useStore">`useStore`</a> 在 funcion 组件使用; <a name="injectStore">`injectStore`</a> 在 class 组件中使用

```tsx
import { StoreBase, createStore } from 'matrox'

class CounterStore extends StoreBase<CounterStore> {
  count = 0
  increment = () => this.setProps({ count: this.count + 1 })
  decrement = () => this.setProps(({ count }) => ({ count: count - 1 }))
}

const { useStore, injectStore } = createStore(CounterStore)
```

### 使用 store

还记得刚刚的 `useStore` 的返回值吗？在 function 组件中调用这个 Hook , 就可以获取到 store 了. 当订阅的 store 状态发生改变的时候, 将会触发组件重渲染.

```tsx
export default function App() {
  const { count, increment, decrement } = useStore()
  return (
    <div className="App">
      <h1>Hello Matrox</h1>
      <h1>{count}</h1>
      <button onClick={increment}>increment</button>
      <button onClick={decrement}>decrement</button>
    </div>
  )
}
```

### class 组件中使用 store

现在 `injectStore` 要大显生手了, 它其实是属性属性装饰器, 在 class 使用它, 就可以获取到 store 了. 当然了, 你可以同时 'inject' 多个 store. 是不是 很像 `Spring` 呢, 没错, `matrox` 内部实现其实就是一个 `DI` 容器, 由它来帮我们实例化 store 实例

```tsx
export default class App extends React.Component {
  @injectStore()
  counterStore: Readonly<CounterStore>

  render() {
    const { count, increment, decrement } = this.counterStore

    return (
      <div className="App">
        <h1>Hello Matrox</h1>
        <h1>{count}</h1>
        <button onClick={increment}>increment</button>
        <button onClick={decrement}>decrement</button>
      </div>
    )
  }
}
```

> `注意:` 无论是 `useStore`,`injectStore` 和后面会提到的 `getStore`, 返回的 store 实例都是只读的!

## 进阶用法

### store 的初始化参数

store 可以传入初始化参数可以是 `palin object`,或者是返回 `palin object`的`callback`

如下方的例子一样, 我们可以在 `useStore` 或者 `injectStore` 传入参数, 例如在 function 组件中:

> `注意:` `useStore`,`useStore`等初始化参数只会使用实例化时的第一个的参数

```tsx
import { StoreBase, createStore } from 'matrox'

class CounterStore extends StoreBase<CounterStore> {
  count = 0
  increment = () => this.setProps({ count: this.count + 1 })
  decrement = () => this.setProps(({ count }) => ({ count: count - 1 }))
}

const { useStore, injectStore } = createStore(CounterStore)

export default function App() {
  const { count, increment, decrement } = useStore(() => {
    count: 1
  })
  return (
    <div className="App">
      <h1>Hello Matrox</h1>
      <h1>{count}</h1>
      <button onClick={increment}>increment</button>
      <button onClick={decrement}>decrement</button>
    </div>
  )
}
```

### store 之间的依赖

一般来说, 我们推荐组合多个 store 使用, 这样更方便防止命名冲突, 减轻心智负担, 便于查找. 但是 store 之间很可能会出现需要依赖其他 store 的情况.

在 `matrox` 中非常简单: 由于 store 和 class 组件都是 class 形态的, 所以在 store 中引用 store 和 class 组件中完全一样! 当被依赖的 store 更新, 会触发依赖它的 store 更新.

```tsx
import { StoreBase, createStore } from 'matrox'

// store1
class CounterStore extends StoreBase<CounterStore> {
  count = 0
  increment = () => this.setProps({ count: this.count + 1 })
  decrement = () => this.setProps(({ count }) => ({ count: count - 1 }))
}

const { useStore, injectStore } = createStore(CounterStore)

//  store2
class DoubleCounterStore extends StoreBase<DoubleCounterStore> {
  @injectStore()
  counterStore: Readonly<CounterStore>

  get doubleCount() {
    return this.counterStore.count
  }
}

const { useStore: useDoubleCounterStore, injectStore: injectDoubleCounterStore } = createStore(
  DoubleCounterStore
)
```

> `提醒:` 小心循环依赖！

### 忽略订阅

使用过 `mobx` 的同学可能知道, 有时候我们并不需要观察某个数据, 仅仅把它当做全局变量使用, 我们应该如何做呢?

如下面的例子一样，我们只需要加入 <a name="ignore">`@ignore`</a> 装饰器就可以了:

```tsx
import { StoreBase, createStore } from 'matrox'

class CounterStore extends StoreBase<CounterStore> {
  @ignore count = 0
}
```

### 组件外获取 store 的状态

有时候我们需要在组件外使用 store, 这时候我们可以使用 <a name="getStore">`getStore`</a> 和 <a name="getState">`getState`</a>, 如下:

```tsx
import { StoreBase, createStore } from 'matrox'

class CounterStore extends StoreBase<CounterStore> {
  count = 0
}

// getStore 获取 store 实例, getState 获取 store 序列化之后的 plain object
const { getStore, getState } = createStore(CounterStore)
```

### 应用中间件

`matrox` 可以使用中间件! 其中间件写法 `redux` 中间件非常相似!

```tsx
import { StoreBase, createStore } from 'matrox'

class CounterStore extends StoreBase<CounterStore> {
  count = 0
}

// matrox 自带了 persist 中间件, 有兴趣可以参考源码
const { getStore, getState, injectStore } = createStore(CounterStore, { middleware: [persist] })
```

当 store 太多的时候, 一个一个配置是十分麻烦的事所以提供了 <a name="globalConfig">`globalConfig`</a> api 来提供全局配置, 在特定的 store 你还可以忽略某个中间件.

```tsx
import { StoreBase, createStore, globalConfig } from 'matrox'

globalConfig({ middleware: [persist] })

class CounterStore extends StoreBase<CounterStore> {
  count = 0
}

// matrox 自带了 persist 中间件, 有兴趣可以参考源码
const { getStore, getState, injectStore } = createStore(CounterStore, {
  ignoreMiddleware: [persist]
})
```

你完全可以自己定义中间件, 来加强你的 store, 以下是内置 `persit` 中间件示例:

```tsx
import { MiddleWare, StoreAPI, Dispatch } from '../types/middleware'
import { Action } from '../types/StoreBase'

const persist: MiddleWare = (store: StoreAPI) => {
  const { key, isSessionStore } = store.meta

  const state = JSON.parse(localStorage.getItem(key) || '{}')
  store.updatePropsWithoutRender(state)

  return (dispatch: Dispatch) => async (action: Action<any, string>) => {
    await dispatch(action)

    if (!isSessionStore) {
      const state = store.getState()
      localStorage.setItem(key, JSON.stringify(state))
    }
  }
}

export default persist
```

### 内置持久化

`matrox` 内置的持久化有更简洁的写法, 当然你也可以使用`globalConfig`来全局配置.

```tsx
import { StoreBase, createStore } from 'matrox'

class CounterStore extends StoreBase<CounterStore> {
  count = 0
}

// getStore 获取 store 实例, getState 获取 store 序列化之后的 plain object
const { getStore, getState } = createStore(CounterStore, { persist: true })
```

### 预加载

`matrox` 有预加载 store 的功能. 例如你需要请求一个非常大的 menu tree 数据, 你可以使用 <a name="preloadStore">`preloadStore`</a> 提前实例化 store, 来预加载数据:

```tsx
// store.ts
import { StoreBase, createStore } from 'matrox'

class CounterStore extends StoreBase<CounterStore> {
  data: any[] = []

  constructor() {
    super()
    this.fetchData()
  }

  fetchData = () => {
    fetch(`/tree`).then(data => (this.data = data))
  }
}

// getStore 获取 store 实例, getState 获取 store 序列化之后的 plain object
const { preloadStore } = createStore(CounterStore)

// app.ts
preloadStore()
```
### 依赖收集和性能优化

- `matrox` 内部使用和 `mobx` 一样的 `Proxy` api 来进行依赖收集(只收集浅层数据,所以 store 内部数据无需`toJS`), 所以当你组件只订阅了其使用 store 属性的更新.
- 为了应用批量更新策略, store 继承的 `setProps`, <a name="forceUpdate">`forceUpdate`</a> 方法均是异步的, 如果需要使用更新之后的数据, 请使用`.then()`方法, 或者使用 `await` 关键字.
