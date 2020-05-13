import { renderHook, act } from '@testing-library/react-hooks'

import useForceUpdate from '../useForceUpdate'

describe('useForceUpdate', () => {
  test('hook useForceUpdate should render component', () => {
    let count = 0
    const hook = renderHook(() => {
      count++
      return useForceUpdate()
    })
    expect(count).toBe(1)
    act(() => hook.result.current())
    expect(count).toBe(2)
    act(() => hook.result.current())
    expect(count).toBe(3)
  })
})
