import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

// Create a test Convex client (mocked)
const createTestConvexClient = () => {
  return new ConvexReactClient('test-url', {
    skipConvexDeploymentUrlCheck: true,
  })
}

// Create a custom render function
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })

  const convexClient = createTestConvexClient()

  return (
    <ConvexProvider client={convexClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ConvexProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }