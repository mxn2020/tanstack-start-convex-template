import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordForm } from '~/components/auth/ResetPasswordForm'
import { AuthLayout } from '~/components/auth/AuthLayout'

export const Route = createFileRoute('/auth/reset-password')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || '',
    }
  },
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  return (
    <AuthLayout 
      title="New Password" 
      subtitle="Almost there! Set your new password 🔐"
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}