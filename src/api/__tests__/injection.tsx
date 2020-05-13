import injection from '../injection'

import * as React from 'react'
import '@testing-library/jest-dom'
import { render, act, fireEvent } from '@testing-library/react'
import { store, StoreBase } from '../..'
import { getInjector } from '../../core/Injector'
import ignore from '../ignore'
import getInjection from '../getInjection'

describe('injection and injectedComponent', () => {
  const injector = getInjector()
  const injectorAny: any = injector

  @store('application')
  class G extends StoreBase<G> {
    title = '='

    changeTitle = () => {
      this.setProps(({ title }) => ({ title: title + '1' }))
    }
  }

  @store('application')
  class A extends StoreBase<A> {
    @injection(G)
    g!: Readonly<G>

    name = '0'
    @ignore name0 = ''

    get title() {
      return this.g.title
    }

    changeTitle = this.g.changeTitle

    changeName = () => {
      this.setProps(({ name }) => ({ name: name + '1' }))
    }

    changeName0 = () => {
      this.setProps(({ name0 }) => ({ name0: name0 + '1' }))
    }
  }

  @store('session')
  class B extends StoreBase<B> {
    age = 0
  }

  let param = 10
  let param1 = 100

  let count = 0
  let count1 = 0

  class Comp extends React.Component {
    @injection(A, { name: param + '' })
    a!: Readonly<A>

    @injection(B, { age: param })
    b!: Readonly<B>

    render() {
      count++
      param++
      const { name } = this.a
      const { age } = this.b
      return (
        <div>
          <div>Comp {count} times</div>
          <div>Comp I'm {name} </div>
          <div>Comp {age} years old</div>
          <div>Comp {this.a.title}</div>

          <button onClick={this.a.changeName}>changeName</button>
          <button onClick={this.a.changeName0}>changeName0</button>
          <button onClick={this.a.changeTitle}>changeTitle</button>
        </div>
      )
    }
  }

  class Comp1 extends React.Component {
    @injection(A, (param1 => () => ({ name: param1 + '' }))(param1))
    a!: Readonly<A>

    @injection(B, (param1 => () => ({ age: param1 }))(param1))
    b!: Readonly<B>

    render() {
      count1++
      param1++
      const { name } = this.a
      const { age } = this.b
      return (
        <div>
          <div>Comp1 {count1} times</div>
          <div>Comp1 I'm {name} </div>
          <div>Comp1 {age} years old</div>
        </div>
      )
    }
  }

  beforeEach(() => {
    param = 10
    param1 = 100

    count = 0
    count1 = 0

    injectorAny.clear()
  })

  test('store parameters should just works once', () => {
    const warpper = render(<Comp />)
    expect(param).toBe(11)
    expect(warpper.getByText(`Comp I'm 10`)).toBeInTheDocument()
    expect(warpper.getByText('Comp 10 years old')).toBeInTheDocument()
    warpper.rerender(<Comp />)
    expect(param).toBe(12)
    expect(warpper.getByText(`Comp I'm 10`)).toBeInTheDocument()
    expect(warpper.getByText('Comp 10 years old')).toBeInTheDocument()
    warpper.unmount()

    const warpper1 = render(<Comp1 />)
    expect(param1).toBe(101)
    expect(warpper1.getByText(`Comp1 I'm 10`)).toBeInTheDocument()
    expect(warpper1.getByText('Comp1 100 years old')).toBeInTheDocument()
    warpper1.rerender(<Comp1 />)
    expect(param1).toBe(102)
    expect(warpper1.getByText(`Comp1 I'm 10`)).toBeInTheDocument()
    expect(warpper1.getByText('Comp1 100 years old')).toBeInTheDocument()
    warpper1.unmount()

    expect(injectorAny.appContainer.size).toBe(2)
    expect(injectorAny.sessContainer.size).toBe(0)
  })

  test('store parameters should just works once', async () => {
    const warpper = render(<Comp />)
    const warpper1 = render(<Comp1 />)

    expect(count).toBe(1)
    expect(count1).toBe(1)
    expect(warpper.getByText(`Comp I'm 10`)).toBeInTheDocument()
    expect(warpper.getByText('Comp 10 years old')).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm 10`)).toBeInTheDocument()
    expect(warpper1.getByText('Comp1 10 years old')).toBeInTheDocument()

    // 异步渲染
    fireEvent.click(warpper.getByText(/^changeName$/))
    expect(count).toBe(1)
    expect(count1).toBe(1)

    await Promise.resolve()
    expect(count).toBe(2)
    expect(count1).toBe(2)
    expect(warpper.getByText(`Comp I'm 101`)).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm 101`)).toBeInTheDocument()

    // 批量渲染
    fireEvent.click(warpper.getByText(/^changeName$/))
    fireEvent.click(warpper.getByText(/^changeName$/))

    await Promise.resolve()
    expect(count).toBe(3)
    expect(count1).toBe(3)
    expect(warpper.getByText(`Comp I'm 10111`)).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm 10111`)).toBeInTheDocument()

    // ignore 不渲染
    fireEvent.click(warpper.getByText(/^changeName0$/))
    fireEvent.click(warpper.getByText(/^changeName0$/))

    await Promise.resolve()
    expect(count).toBe(3)
    expect(count1).toBe(3)
    expect(warpper.getByText(`Comp I'm 10111`)).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm 10111`)).toBeInTheDocument()

    // 改变global 都渲染
    fireEvent.click(warpper.getByText(/^changeTitle$/))

    await Promise.resolve()
    expect(count).toBe(4)
    expect(count1).toBe(4)
    expect(warpper.getByText(`Comp I'm 10111`)).toBeInTheDocument()
    expect(warpper.getByText(`Comp =1`)).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm 10111`)).toBeInTheDocument()

    // 改变global 都渲染
    const g = getInjection(G)
    const a = getInjection(A)
    g?.changeTitle()
    a?.changeName()

    await Promise.resolve()

    expect(count).toBe(5)
    expect(count1).toBe(5)

    expect(warpper.getByText(`Comp I'm 101111`)).toBeInTheDocument()
    expect(warpper.getByText(`Comp =11`)).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm 101111`)).toBeInTheDocument()

    // 外包调用
    g?.setProps({ title: 'g' })
    a?.setProps({ name: 'a' })
    expect(g?.title).toBe('g')
    expect(a?.name).toBe('a')

    await Promise.resolve()

    expect(count).toBe(6)
    expect(count1).toBe(6)

    expect(warpper.getByText(`Comp I'm a`)).toBeInTheDocument()
    expect(warpper.getByText(`Comp g`)).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm a`)).toBeInTheDocument()

    warpper.unmount()
    warpper1.unmount()

    expect(injectorAny.appContainer.size).toBe(2)
    expect(injectorAny.sessContainer.size).toBe(0)
  })
})
