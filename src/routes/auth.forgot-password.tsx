import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordForm } from '~/components/ForgotPasswordForm'

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}