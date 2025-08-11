import { describe, it, expect } from 'vitest'

describe('Test Suite Setup', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to jsdom environment', () => {
    expect(document.body).toBeDefined()
    expect(window.location).toBeDefined()
  })

  it('should have MSW server available', () => {
    expect(globalThis.__MSW_SERVER__).toBeDefined()
  })

  it('should support modern JavaScript features', () => {
    const arr = [1, 2, 3]
    const doubled = arr.map(x => x * 2)
    expect(doubled).toEqual([2, 4, 6])
  })
})