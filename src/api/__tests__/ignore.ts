import 'reflect-metadata'

import ignore from '../ignore'

describe('ignore', () => {
  test(`decorator ignore should define the 'ignoredProperty' to class'prototype metadata`, () => {
    class A {
      @ignore name = '1'
    }

    const ignoredProperty: string = Reflect.getMetadata('ignoredProperty', A.prototype, 'name')

    expect(ignoredProperty).toBe('name')
  })
})
