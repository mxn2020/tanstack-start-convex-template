import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { authClient } from '~/lib/auth-client'

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const tokenParam = urlParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Invalid or missing reset token')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    if (!token) {
      setError('Invalid or missing reset token')
      setIsLoading(false)
      return
    }

    try {
      const result = await authClient.resetPassword({
        newPassword: formData.password,
        token,
      })

      if (result.error) {
        setError(result.error.message || 'An error occurred')
      } else {
        setIsSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate({ to: '/auth/login', search: { redirect: undefined } })
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Password Reset Successful
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Your password has been successfully reset. You will be redirected to the sign in page shortly.
        </p>
        
        <a
          href="/auth/login"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <span>Sign In Now</span>
          <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Reset Your Password
        </h3>
        <p className="text-gray-600">
          Enter your new password below to complete the reset process.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Create a strong password"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Confirm your new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Resetting password...</span>
            </>
          ) : (
            <>
              <span>Reset Password</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="text-center pt-4 border-t border-gray-200">
        <a
          href="/auth/login"
          className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors hover:underline"
        >
          Back to Sign In
        </a>
      </div>
    </div>
  )
}