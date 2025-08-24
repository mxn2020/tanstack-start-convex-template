import { useEffect } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useSession } from '~/lib/auth-client'
import { Loader } from '../Loader'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const session = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Skip auth check for auth routes
    if (location.pathname.startsWith('/auth/')) {
      return
    }

    // If not loading and no session, redirect to login
    if (!session.isPending && !session.data) {
      navigate({
        to: '/auth/login',
        search: {
          redirect: location.pathname,
        },
      })
    }
  }, [session.isPending, session.data, location.pathname, navigate])

  // Show loading while checking session
  if (session.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  // If on auth routes, always show content
  if (location.pathname.startsWith('/auth/')) {
    return <>{children}</>
  }

  // If not authenticated and not on auth routes, show nothing (will redirect)
  if (!session.data) {
    return null
  }

  // User is authenticated, show protected content
  return <>{children}</>
}