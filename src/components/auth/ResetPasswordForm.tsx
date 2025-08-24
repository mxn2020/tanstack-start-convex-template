import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
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
      setError('Passwords don\'t match, bestie! 😅')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password needs to be at least 8 characters long! 💪')
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
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token && !error) {
    return (
      <div className="text-center space-y-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-purple-600 font-medium">Loading reset form... ⏳</p>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="text-8xl mb-6">🎉</div>
        <h3 className="text-2xl font-black text-purple-700 mb-4">
          Password reset successful! 🔥
        </h3>
        <p className="text-purple-600 font-medium mb-6 leading-relaxed">
          Your password has been updated successfully! You're all set to get back to crushing those yallas with your squad! 💪
        </p>
        
        <button
          onClick={() => navigate({ to: '/auth/login', search: { redirect: undefined } })}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
        >
          <CheckCircle className="h-5 w-5" />
          <span>Let's Yalla! 🚀</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className="text-xl font-black text-purple-700 mb-2">
          Create New Password
        </h3>
        <p className="text-purple-600 font-medium">
          Time to set up a fresh password that's strong and secure! 💪
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl font-medium">
            {error}
          </div>
        )}

        {/* Password Field */}
        <div>
          <label className="block text-sm font-bold text-purple-700 mb-2">
            New Password 🔐
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-12 pr-12 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all text-purple-800 font-medium placeholder-purple-400"
              placeholder="Make it strong! 💪"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-purple-500 mt-2 font-medium">
            At least 8 characters with a mix of letters, numbers, and symbols
          </p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-bold text-purple-700 mb-2">
            Confirm New Password 🔒
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full pl-12 pr-12 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all text-purple-800 font-medium placeholder-purple-400"
              placeholder="One more time!"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Password Strength Indicator */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs">
            <div className={`w-3 h-3 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={`font-medium ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
              At least 8 characters
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className={`w-3 h-3 rounded-full ${/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={`font-medium ${/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
              Upper & lowercase letters
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className={`w-3 h-3 rounded-full ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={`font-medium ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
              At least one number
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Updating password... 🔄</span>
            </>
          ) : (
            <>
              <span>Update Password 🚀</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="text-center pt-4 border-t border-purple-200">
        <a
          href="/auth/login"
          className="text-purple-600 hover:text-purple-800 font-bold transition-colors"
        >
          Remember your password? Sign in instead
        </a>
      </div>
    </div>
  )
}