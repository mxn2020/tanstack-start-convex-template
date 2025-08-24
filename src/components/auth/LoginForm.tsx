// src/components/LoginForm.tsx

import { useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { signInEmail, signInSocial } from '~/lib/auth-client'

export function LoginForm() {
  const search = useSearch({ from: '/auth/login' })
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signInEmail({
        email: formData.email,
        password: formData.password,
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

  const handleSocialSignIn = async (provider: 'google' | 'github' | 'apple' | 'twitter') => {
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
    <div className="space-y-6">
      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSocialSignIn('google')}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-3 border-2 border-purple-200 rounded-2xl text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all transform hover:scale-105 font-bold disabled:opacity-50 disabled:transform-none"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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
          Google
        </button>
        <button
          onClick={() => handleSocialSignIn('apple')}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-3 border-2 border-purple-200 rounded-2xl text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all transform hover:scale-105 font-bold disabled:opacity-50 disabled:transform-none"
        >
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Apple
        </button>
        <button
          onClick={() => handleSocialSignIn('twitter')}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-3 border-2 border-purple-200 rounded-2xl text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all transform hover:scale-105 font-bold disabled:opacity-50 disabled:transform-none"
        >
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X
        </button>
        <button
          onClick={() => handleSocialSignIn('github')}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-3 border-2 border-purple-200 rounded-2xl text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all transform hover:scale-105 font-bold disabled:opacity-50 disabled:transform-none"
        >
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-purple-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-purple-500 font-bold">or continue with email 💌</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl font-medium">
            {error}
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="block text-sm font-bold text-purple-700 mb-2">
            Email Address ✨
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-12 pr-4 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all text-purple-800 font-medium placeholder-purple-400"
              placeholder="your.email@yalla.wtf"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-bold text-purple-700 mb-2">
            Password 🔐
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-12 pr-12 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all text-purple-800 font-medium placeholder-purple-400"
              placeholder="Your super secret password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <a
            href="/auth/forgot-password"
            className="text-sm text-purple-600 hover:text-purple-800 font-bold hover:underline transition-colors"
          >
            Forgot your password? 🤔
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Getting you in... 🚀</span>
            </>
          ) : (
            <>
              <span>Let's Yalla! 🔥</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center pt-4 border-t border-purple-200">
        <p className="text-purple-600 font-medium">
          New to the squad?{' '}
          <a
            href="/auth/signup"
            className="text-purple-800 font-black hover:text-pink-600 transition-colors hover:underline"
          >
            Join the vibe! ✨
          </a>
        </p>
      </div>
    </div>
  )
}