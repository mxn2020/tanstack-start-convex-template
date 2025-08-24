import { useState } from 'react'
import { Mail, ArrowRight, ArrowLeft, Send } from 'lucide-react'
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
        <div className="text-8xl mb-6">📧</div>
        <h3 className="text-2xl font-black text-purple-700 mb-4">
          Check your inbox, bestie! 💌
        </h3>
        <p className="text-purple-600 font-medium mb-6 leading-relaxed">
          We've sent a password reset link to <strong>{email}</strong>. 
          Click the link in the email to reset your password and get back to crushing those yallas! 🔥
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              setIsEmailSent(false)
              setEmail('')
              setError('')
            }}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
          >
            <Send className="h-5 w-5" />
            <span>Resend Email</span>
          </button>
          
          <a
            href="/auth/login"
            className="w-full text-purple-600 hover:text-purple-800 py-3 font-bold transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🤔</div>
        <h3 className="text-xl font-black text-purple-700 mb-2">
          Forgot your password?
        </h3>
        <p className="text-purple-600 font-medium">
          No worries! We'll send you a reset link to get you back in the game! 🎮
        </p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all text-purple-800 font-medium placeholder-purple-400"
              placeholder="your.email@yalla.wtf"
              required
            />
          </div>
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
              <span>Sending magic link... ✨</span>
            </>
          ) : (
            <>
              <span>Send Reset Link 🚀</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="text-center pt-4 border-t border-purple-200">
        <a
          href="/auth/login"
          className="text-purple-600 hover:text-purple-800 font-bold transition-colors flex items-center justify-center space-x-2 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Login</span>
        </a>
      </div>
    </div>
  )
}