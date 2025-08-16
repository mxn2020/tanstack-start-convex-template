import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordForm } from '~/components/auth/ForgotPasswordForm'
import { AuthLayout } from '~/components/auth/AuthLayout'

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="No worries, we'll help you get back in! 🔑"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}