import compose from '../compose'

describe('compose', () => {
  test('function compose should compose all functions to one', () => {
    const fun1 = compose()

    expect(fun1).toBeInstanceOf(Function)
    expect(fun1(1)).toBe(1)

    const fn1 = (a: number) => a + 1
    const fn2 = (a: number) => a * 2

    const fun2 = compose(fn1)
    expect(fun2).toBeInstanceOf(Function)
    expect(fun2(1)).toBe(2)

    const fun3 = compose(fn1, fn2)
    expect(fun3).toBeInstanceOf(Function)
    expect(fun3(1)).toBe(3)

    const fun4 = compose(fn2, fn1)
    expect(fun4).toBeInstanceOf(Function)
    expect(fun4(1)).toBe(4)
  })
})
