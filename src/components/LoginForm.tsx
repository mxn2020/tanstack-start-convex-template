import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { signInEmail, signInSocial } from '~/lib/auth-client'
import { SaveButton } from './SaveButton'

export function LoginForm() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/auth/login' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [availableProviders, setAvailableProviders] = useState({ google: false, apple: false, twitter: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signInEmail({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || 'An error occurred')
      } else {
        // Redirect to the intended page or home
        const redirectTo = (search as any)?.redirect || '/'
        // Use window.location.href for full page reload to ensure session is properly loaded
        window.location.href = redirectTo
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: 'google' | 'apple' | 'twitter') => {
    setIsLoading(true)
    setError('')

    try {
      await signInSocial({
        provider,
        callbackURL: (search as any)?.redirect || '/',
      })
      // Social sign in will handle redirect automatically
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="/auth/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div className="flex gap-2">
            <SaveButton type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </SaveButton>
          </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('google')}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialSignIn('apple')}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C8.396 0 8.002.014 6.796.072 5.592.13 4.794.331 4.125.63c-.695.3-1.283.7-1.868 1.285C1.672 2.5 1.271 3.088.971 3.783.672 4.452.471 5.25.413 6.454.355 7.66.341 8.054.341 11.675s.014 4.015.072 5.221c.058 1.204.259 2.002.558 2.671.3.695.7 1.283 1.285 1.868.585.585 1.173.985 1.868 1.285.669.299 1.467.5 2.671.558 1.206.058 1.6.072 5.221.072s4.015-.014 5.221-.072c1.204-.058 2.002-.259 2.671-.558.695-.3 1.283-.7 1.868-1.285.585-.585.985-1.173 1.285-1.868.299-.669.5-1.467.558-2.671.058-1.206.072-1.6.072-5.221s-.014-4.015-.072-5.221c-.058-1.204-.259-2.002-.558-2.671-.3-.695-.7-1.283-1.285-1.868C19.497 1.672 18.909 1.271 18.214.971c-.669-.299-1.467-.5-2.671-.558C14.337.355 13.943.341 10.322.341s-4.015.014-5.221.072C3.897.471 3.099.672 2.43.971c-.695.3-1.283.7-1.868 1.285C-.023 2.841-.424 3.429-.724 4.124-.023 4.793.178 5.591.236 6.795.294 8.001.308 8.395.308 12.016s-.014 4.015.072 5.221c.058 1.204.259 2.002.558 2.671.3.695.7 1.283 1.285 1.868.585.585 1.173.985 1.868 1.285.669.299 1.467.5 2.671.558 1.206.058 1.6.072 5.221.072s4.015-.014 5.221-.072c1.204-.058 2.002-.259 2.671-.558.695-.3 1.283-.7 1.868-1.285.585-.585.985-1.173 1.285-1.868.299-.669.5-1.467.558-2.671.058-1.206.072-1.6.072-5.221s-.014-4.015-.072-5.221c-.058-1.204-.259-2.002-.558-2.671-.3-.695-.7-1.283-1.285-1.868C20.503.672 19.915.271 19.22-.029c-.669-.299-1.467-.5-2.671-.558C15.343-.016 14.949-.03 11.328-.03zm-.691 1.378c.362-.002.763-.002 1.196 0 3.581 0 4.008.014 5.235.072 1.264.058 1.95.269 2.407.447.605.235 1.037.516 1.492.971.455.455.736.887.971 1.492.178.457.389 1.143.447 2.407.058 1.227.072 1.654.072 5.235s-.014 4.008-.072 5.235c-.058 1.264-.269 1.95-.447 2.407-.235.605-.516 1.037-.971 1.492-.455.455-.887.736-1.492.971-.457.178-1.143.389-2.407.447-1.227.058-1.654.072-5.235.072s-4.008-.014-5.235-.072c-1.264-.058-1.95-.269-2.407-.447-.605-.235-1.037-.516-1.492-.971-.455-.455-.736-.887-.971-1.492-.178-.457-.389-1.143-.447-2.407-.058-1.227-.072-1.654-.072-5.235s.014-4.008.072-5.235c.058-1.264.269-1.95.447-2.407.235-.605.516-1.037.971-1.492.455-.455.887-.736 1.492-.971.457-.178 1.143-.389 2.407-.447 1.074-.049 1.49-.063 4.04-.071v.003zm8.09 2.595c-.89 0-1.611.721-1.611 1.611s.721 1.611 1.611 1.611 1.611-.721 1.611-1.611-.721-1.611-1.611-1.611zm-6.402 1.677c-3.749 0-6.787 3.038-6.787 6.787s3.038 6.787 6.787 6.787 6.787-3.038 6.787-6.787-3.038-6.787-6.787-6.787zm0 1.379c2.971 0 5.381 2.41 5.381 5.381s-2.41 5.381-5.381 5.381-5.381-2.41-5.381-5.381 2.41-5.381 5.381-5.381z"/>
                </svg>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialSignIn('twitter')}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                </button>
            </div>
            </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}