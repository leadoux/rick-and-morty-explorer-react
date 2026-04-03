import { describe, expect, it } from 'vitest'
import { isNoResultsError } from './errors'

describe('isNoResultsError', () => {
  it('returns true for nothing here graphql errors', () => {
    expect(
      isNoResultsError({
        graphQLErrors: [{ message: 'There is nothing here' }],
      }),
    ).toBe(true)
  })

  it('returns false for unrelated errors', () => {
    expect(
      isNoResultsError({
        graphQLErrors: [{ message: 'Internal server error' }],
      }),
    ).toBe(false)
  })
})
