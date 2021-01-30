import * as React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import useInjection from '../useInjection'
import { StoreBase } from '../..'
import { getInjector } from '../../core/Injector'
import store from '../store'

describe('useInjection', () => {
  @store()
  class A extends StoreBase<A> {
    name = '1'
  }

  const injector = getInjector()
  const injectorAny: any = injector

  beforeEach(() => {
    injectorAny.clear()
  })

  test("hook useInjection should just live form creation to destroy of it's creater component", async () => {
    const arr = [A]

    arr.forEach((Clazz: any) => {
      const hook = renderHook(() => useInjection(Clazz, ''))
      const a = hook.result.current

      const hook1 = renderHook(() => useInjection(Clazz, ''))
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

  test(`component using hooks 'useInjection' should render accurately`, async () => {
    let count = 0
    const Comp: React.FC = () => {
      const a = useInjection(A, '')

      const changeName = () => {
        a.setProps(({ name }) => ({ name: name + '-' }))
      }

      React.useEffect(() => {
        count++
      })

      return (
        <div>
          <div data-testid="name">{a.name}</div>
          <button onClick={changeName}>changeName</button>
        </div>
      )
    }

    render(<Comp />)
    expect(count).toBe(1)
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
