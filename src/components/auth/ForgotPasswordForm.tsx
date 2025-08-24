import { useState } from 'react'
import { Mail, ArrowRight, ArrowLeft, Send, Loader2 } from 'lucide-react'
import { authClient } from '~/lib/auth-client'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await authClient.forgetPassword({
        email,
        redirectTo: '/auth/reset-password',
      })

      if (result.error) {
        setError(result.error.message || 'An error occurred')
      } else {
        setIsEmailSent(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Check your email
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We've sent a password reset link to <strong className="text-gray-900">{email}</strong>. 
          Click the link in the email to reset your password.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              setIsEmailSent(false)
              setEmail('')
              setError('')
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Send className="h-5 w-5" />
            <span>Resend Email</span>
          </button>
          
          <a
            href="/auth/login"
            className="w-full text-gray-600 hover:text-gray-800 py-3 font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign In</span>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Forgot your password?
        </h3>
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sending reset link...</span>
            </>
          ) : (
            <>
              <span>Send Reset Link</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="text-center pt-4 border-t border-gray-200">
        <a
          href="/auth/login"
          className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors flex items-center justify-center space-x-2 mx-auto hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </a>
      </div>
    </div>
  )
}