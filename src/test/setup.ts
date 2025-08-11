import '@testing-library/jest-dom'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Setup MSW for mocking API calls
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Create handlers for test API endpoints
const handlers = [
  // Mock Convex API endpoints
  http.get('/api/convex/boards', () => {
    return HttpResponse.json([
      {
        _id: 'test-board-1',
        title: 'Test Board',
        _creationTime: Date.now(),
      }
    ])
  }),
  
  http.get('/api/convex/columns', () => {
    return HttpResponse.json([
      {
        _id: 'test-column-1',
        title: 'To Do',
        boardId: 'test-board-1',
        order: 0,
        _creationTime: Date.now(),
      }
    ])
  }),
]

const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
  cleanup()
})

// Clean up after all tests
afterAll(() => server.close())

// Make server available globally for individual test customization
declare global {
  var __MSW_SERVER__: typeof server
}

globalThis.__MSW_SERVER__ = server