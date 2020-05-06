import {
  compateAction,
  updateTarget,
  reduceUpdateObject,
  getEffectiveLiseners,
  forceUpdate,
  batchingUpdate
} from '../StoreBaseUtils'

describe('StoreBaseUtils', () => {
  test('function batchingUpdate should merge multiple calling for batching update', done => {
    const mockForceUpdate1 = jest.fn(() => undefined)
    const mockForceUpdate2 = jest.fn(() => undefined)
    const mockForceUpdate3 = jest.fn(() => undefined)

    const lisener1 = { forceUpdate: mockForceUpdate1, comp: {}, watchedProps: new Set<string>() }
    const lisener2 = { forceUpdate: mockForceUpdate2, comp: {}, watchedProps: new Set<string>() }
    const lisener3 = { forceUpdate: mockForceUpdate3, comp: {}, watchedProps: new Set<string>() }

    const liseners1 = [lisener1, lisener2]
    const liseners2 = [lisener2, lisener3]

    batchingUpdate(liseners1)
    batchingUpdate(liseners2)
    batchingUpdate(liseners1)

    batchingUpdate(liseners1)
    batchingUpdate(liseners2)
    batchingUpdate(liseners1)

    expect(mockForceUpdate1.mock.calls.length).toBe(0)
    expect(mockForceUpdate2.mock.calls.length).toBe(0)
    expect(mockForceUpdate3.mock.calls.length).toBe(0)

    setTimeout(() => {
      expect(mockForceUpdate1.mock.calls.length).toBe(1)
      expect(mockForceUpdate2.mock.calls.length).toBe(1)
      expect(mockForceUpdate3.mock.calls.length).toBe(1)

      batchingUpdate(liseners1)

      setTimeout(() => {
        expect(mockForceUpdate1.mock.calls.length).toBe(2)
        expect(mockForceUpdate2.mock.calls.length).toBe(2)
        expect(mockForceUpdate3.mock.calls.length).toBe(1)

        done()
      })
    })
  })

  test('function forceUpdate should call all forceUpdate of liseners', () => {
    const mockForceUpdate1 = jest.fn(() => undefined)
    const mockForceUpdate2 = jest.fn(() => undefined)

    const liseners = [
      {
        forceUpdate: mockForceUpdate1,
        comp: {},
        watchedProps: new Set<string>()
      },
      { forceUpdate: mockForceUpdate2, comp: {}, watchedProps: new Set<string>('a') }
    ]

    forceUpdate(liseners)

    expect(mockForceUpdate1.mock.calls.length).toBe(1)
    expect(mockForceUpdate2.mock.calls.length).toBe(1)

    forceUpdate(liseners)

    expect(mockForceUpdate1.mock.calls.length).toBe(2)
    expect(mockForceUpdate2.mock.calls.length).toBe(2)
  })

  test('function getEffectiveLiseners should filter effective liseners', () => {
    const liseners = [
      { forceUpdate: () => undefined, comp: {}, watchedProps: new Set<string>() },
      { forceUpdate: () => undefined, comp: {}, watchedProps: new Set<string>('a') },
      { forceUpdate: () => undefined, comp: {}, watchedProps: new Set<string>('b') }
    ]
    const effectiveLiseners = getEffectiveLiseners(liseners, { a: 1 })
    expect(effectiveLiseners).toEqual([liseners[1]])

    const effectiveLiseners1 = getEffectiveLiseners(liseners, { a: 1, b: 1 })
    expect(effectiveLiseners1).toEqual([liseners[1], liseners[2]])

    const effectiveLiseners2 = getEffectiveLiseners(liseners, { c: 1 })
    expect(effectiveLiseners2).toEqual([])
  })

  test('function reduceUpdateObject should reduce updateObject by target', () => {
    const obj = {}

    class A {
      name = '1'
      age = 2
      company = obj
    }
    const a = new A()

    const rs = reduceUpdateObject(a, { name: '1', age: 2, company: obj })
    expect(rs).toEqual({})

    const rs1 = reduceUpdateObject(a, { name: '0', age: 2, company: { ...obj } })
    expect(rs1).toEqual({ name: '0', company: {} })
  })

  test('function updateTarget should update target by updateObject', () => {
    class A {
      name = '1'
      age = 2
      eat = () => undefined
    }
    const a = new A()

    updateTarget(a, { name: '3', age: 4 })

    expect(a.name).toBe('3')
    expect(a.age).toBe(4)
  })

  test('function compateAction should compate action or payload', () => {
    const action = { payload: 1, type: '1' }

    const action1 = compateAction(action)
    expect(action1).toEqual({ ...action })

    const action2 = compateAction(1)
    expect(action2).toEqual({ payload: 1, type: undefined })

    const actionFn = { payload: () => ({ type: '1', payload: 1 }) }

    const action3 = compateAction(actionFn)
    expect(action3).toEqual({ payload: actionFn, type: undefined })
  })
})
