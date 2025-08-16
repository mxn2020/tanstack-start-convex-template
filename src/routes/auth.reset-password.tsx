import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordForm } from '~/components/ResetPasswordForm'

export const Route = createFileRoute('/auth/reset-password')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || '',
    }
  },
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  return <ResetPasswordForm />
}