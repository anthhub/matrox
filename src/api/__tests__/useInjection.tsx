import * as React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import '@testing-library/jest-dom'
import { render, fireEvent, screen } from '@testing-library/react'
import useInjection from '../useInjection'
import { StoreBase } from '../..'
import { getInjector } from '../../core/Injector'
import store from '../store'

describe('useInjection', () => {
  @store('application')
  class G extends StoreBase<G> {
    title = '='
  }

  @store('application')
  class A extends StoreBase<A> {
    name = '1'
  }

  @store('session')
  class B extends StoreBase<B> {
    age = 1
  }

  const injector = getInjector()
  const injectorAny: any = injector

  beforeEach(() => {
    injectorAny.clear()
  })

  test("hook useInjection should just live form creation to destroy of it's creater component", async () => {
    const arr = [A, B]

    arr.forEach((Clazz: any) => {
      const hook = renderHook(() => useInjection(Clazz))
      const a = hook.result.current

      const hook1 = renderHook(() => useInjection(Clazz))
      const a1 = hook1.result.current

      expect(a).toStrictEqual(a1)

      hook.rerender()
      expect(a).toStrictEqual(hook.result.current)

      hook1.rerender()
      expect(a1).toStrictEqual(hook1.result.current)

      hook.unmount()
      hook1.unmount()
    })
  })

  test(`the args parameter of get method of Injector class should effect the instance at it's initiation firstly`, () => {
    const hook = renderHook(() => useInjection(A, { name: '2' }))
    const a = hook.result.current
    expect(a.name).toBe('2')

    const hook1 = renderHook(() => useInjection(A, { name: '3' }))
    const a1 = hook1.result.current
    expect(a1.name).toBe('2')

    const hook2 = renderHook(() => useInjection(B, { age: 2 }))
    const b = hook2.result.current
    expect(b.age).toBe(2)

    const hook3 = renderHook(() => useInjection(B, { age: 3 }))
    const b1 = hook3.result.current
    expect(b1.age).toBe(2)

    expect(injectorAny.appContainer.size).toBe(1)
    expect(injectorAny.sessContainer.size).toBe(1)

    hook.rerender()
    hook1.rerender()
    hook2.rerender()
    hook3.rerender()

    expect(injectorAny.appContainer.size).toBe(1)
    expect(injectorAny.sessContainer.size).toBe(1)

    hook.unmount()
    hook1.unmount()
    hook2.unmount()
    hook3.unmount()

    expect(injectorAny.appContainer.size).toBe(1)
    expect(injectorAny.sessContainer.size).toBe(0)
  })

  test(`component using hooks 'useInjection' should render accurately`, async () => {
    let count = 0
    const Comp: React.FC = () => {
      const a = useInjection(A)
      const b = useInjection(B)

      const changeName = () => {
        a.setProps(({ name }) => ({ name: name + '-' }))
      }

      const changeAge = () => {
        b.setProps(({ age }) => ({ age: age + 1 }))
      }

      React.useEffect(() => {
        count++
      })

      return (
        <div>
          <div data-testid="name">{a.name}</div>
          <div data-testid="age">{b.age} years old</div>
          <button onClick={changeName}>changeName</button>
          <button onClick={changeAge}>changeAge</button>
        </div>
      )
    }

    render(<Comp />)
    expect(count).toBe(1)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('1 years old')).toBeInTheDocument()
  })
})
