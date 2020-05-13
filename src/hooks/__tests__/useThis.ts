import { renderHook, act } from '@testing-library/react-hooks'
import useThis from '../useThis'

describe('useThis', () => {
  test("hook useThis should mock 'this' like class", async () => {
    const hook = renderHook(() => useThis())
    const _this = hook.result.current
    hook.rerender()
    hook.rerender()
    expect(_this).toBe(hook.result.current)
    hook.unmount()
  })
})
