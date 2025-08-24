import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useSession } from '~/lib/auth-client'
import { syncUserToConvex } from '~/lib/auth'
import { Loader } from '../Loader'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const session = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const syncedUsersRef = useRef<Set<string>>(new Set())

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

    // If user is authenticated and we haven't synced them yet this session
    if (session.data?.user && !syncedUsersRef.current.has(session.data.user.id)) {
      syncedUsersRef.current.add(session.data.user.id)
      
      // Ensure user is synced to Convex (covers existing users who may not be synced)
      syncUserToConvex({
        id: session.data.user.id,
        email: session.data.user.email,
        name: session.data.user.name,
        image: session.data.user.image,
      }).catch((error) => {
        console.warn('Failed to sync user during session check:', error)
        // Don't fail the app if sync fails
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