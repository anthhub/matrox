import injection from '../injection'

import * as React from 'react'
import '@testing-library/jest-dom'
import { render, fireEvent } from '@testing-library/react'
import { StoreBase } from '../..'
import { getInjector } from '../../core/Injector'
import ignore from '../ignore'
import getInjection from '../getInjection'
import store from '../store'

describe('injection', () => {
  const injector = getInjector()
  const injectorAny: any = injector

  @store()
  class G extends StoreBase<G> {
    title = '='

    changeTitle = () => {
      this.setProps(({ title }) => ({ title: title + '1' }))
    }
  }

  @store()
  class A extends StoreBase<A> {
    @injection(G, '')
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

  let param = 10
  let param1 = 100

  let count = 0
  let count1 = 0

  class Comp extends React.Component {
    @injection(A, '')
    a!: Readonly<A>

    render() {
      count++
      param++
      const { name } = this.a

      return (
        <div>
          <div>Comp {count} times</div>
          <div>Comp I'm {name} </div>
          <div>Comp {this.a.title}</div>

          <button onClick={this.a.changeName}>changeName</button>
          <button onClick={this.a.changeName0}>changeName0</button>
          <button onClick={this.a.changeTitle}>changeTitle</button>
        </div>
      )
    }
  }

  class Comp1 extends React.Component {
    @injection(A, '')
    a!: Readonly<A>

    render() {
      count1++
      param1++
      const { name } = this.a

      return (
        <div>
          <div>Comp1 {count1} times</div>
          <div>Comp1 I'm {name} </div>
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

  test(`component using decorator 'injection' should render accurately`, async () => {
    const warpper = render(<Comp />)
    const warpper1 = render(<Comp1 />)

    expect(count).toBe(1)
    expect(count1).toBe(1)
    expect(warpper.getByText(`Comp I'm 0`)).toBeInTheDocument()

    expect(warpper1.getByText(`Comp1 I'm 0`)).toBeInTheDocument()

    // 异步渲染
    fireEvent.click(warpper.getByText(/^changeName$/))
    expect(count).toBe(1)
    expect(count1).toBe(1)

    await Promise.resolve()
    await Promise.resolve()
    expect(count).toBe(2)
    expect(count1).toBe(2)
    expect(warpper.getByText(`Comp I'm 01`)).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm 01`)).toBeInTheDocument()

    // 批量渲染
    fireEvent.click(warpper.getByText(/^changeName$/))
    fireEvent.click(warpper.getByText(/^changeName$/))

    await Promise.resolve()
    await Promise.resolve()

    expect(count).toBe(3)
    expect(count1).toBe(3)
    expect(warpper.getByText(`Comp I'm 011`)).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm 011`)).toBeInTheDocument()

    // ignore 不渲染
    fireEvent.click(warpper.getByText(/^changeName0$/))
    fireEvent.click(warpper.getByText(/^changeName0$/))

    await Promise.resolve()
    await Promise.resolve()
    expect(count).toBe(3)
    expect(count1).toBe(3)
    expect(warpper.getByText(`Comp I'm 011`)).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm 011`)).toBeInTheDocument()

    // 改变global 都渲染
    fireEvent.click(warpper.getByText(/^changeTitle$/))

    await Promise.resolve()
    await Promise.resolve()
    expect(count).toBe(4)
    expect(count1).toBe(4)
    expect(warpper.getByText(`Comp I'm 011`)).toBeInTheDocument()
    expect(warpper.getByText(`Comp =1`)).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm 011`)).toBeInTheDocument()

    // 改变global 都渲染
    const g = getInjection(G, '')
    const a = getInjection(A, '')
    g?.changeTitle()
    a?.changeName()

    await Promise.resolve()
    await Promise.resolve()

    // expect(count).toBe(5)
    // expect(count1).toBe(5)

    expect(warpper.getByText(`Comp I'm 0111`)).toBeInTheDocument()
    expect(warpper.getByText(`Comp =11`)).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm 0111`)).toBeInTheDocument()

    // 外包调用
    g?.setProps({ title: 'g' })
    a?.setProps({ name: 'a' })

    await Promise.resolve()
    await Promise.resolve()

    expect(g?.title).toBe('g')
    expect(a?.name).toBe('a')

    expect(count).toBe(6)
    expect(count1).toBe(6)

    expect(warpper.getByText(`Comp I'm a`)).toBeInTheDocument()
    expect(warpper.getByText(`Comp g`)).toBeInTheDocument()
    expect(warpper1.getByText(`Comp1 I'm a`)).toBeInTheDocument()

    warpper.unmount()
    warpper1.unmount()

    expect(injectorAny.appContainer.size).toBe(2)
  })
})
