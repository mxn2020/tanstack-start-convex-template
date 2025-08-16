/// <reference types="vite/client" />
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production'
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
  HeadContent,
  Scripts,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { Toaster } from 'react-hot-toast'
import type { QueryClient } from '@tanstack/react-query'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { IconLink } from '~/components/IconLink'
import { NotFound } from '~/components/NotFound'
import { AuthGuard } from '~/components/auth/AuthGuard'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'
import { Loader } from '~/components/Loader'
import { useSession, signOut } from '~/lib/auth-client'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title:
          'TanStack Start | Type-Safe, Client-First, Full-Stack React Framework',
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <AuthGuard>
        <Outlet />
      </AuthGuard>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const session = useSession()
  const isAuthRoute = location.pathname.startsWith('/auth/')

  const handleLogout = async () => {
    await signOut()
    // Redirect will be handled by AuthGuard
  }

  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="h-screen flex flex-col min-h-0">
          {!isAuthRoute && (
            <div className="bg-slate-900 border-b border-slate-800 flex items-center justify-between py-4 px-8 box-border">
              <div className="flex items-center gap-4">
                <div>
                  <Link to="/boards" className="block leading-tight">
                    <div className="font-black text-2xl text-white">Trellaux</div>
                    <div className="text-slate-500">a TanStack Demo</div>
                  </Link>
                </div>
                <nav className="flex items-center gap-4 ml-8">
                  <Link
                    to="/boards"
                    className="text-white hover:text-slate-300 font-medium transition-colors"
                    activeOptions={{ exact: false }}
                    activeProps={{ className: "text-blue-400" }}
                  >
                    Boards
                  </Link>
                </nav>
                <LoadingIndicator />
              </div>
              <div className="flex items-center gap-6">
                {session.data && (
                  <div className="flex items-center gap-4">
                    <span className="text-white text-sm">
                      {session.data.user.name || session.data.user.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
                <IconLink
                  href="https://github.com/TanStack/router/tree/main/examples/react/start-trellaux"
                  label="Source"
                  icon="/github-mark-white.png"
                />
                <IconLink
                  href="https://tanstack.com"
                  icon="/tanstack.png"
                  label="TanStack"
                />
              </div>
            </div>
          )}

          <div className="flex-grow min-h-0 h-full flex flex-col">
            {children}
            <Toaster />
          </div>
        </div>
        <ReactQueryDevtools />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}

function LoadingIndicator() {
  const isLoading = useRouterState({ select: (s) => s.isLoading })
  return (
    <div
      className={`h-12 transition-all duration-300 ${
        isLoading ? `opacity-100 delay-300` : `opacity-0 delay-0`
      }`}
    >
      <Loader />
    </div>
  )
}
