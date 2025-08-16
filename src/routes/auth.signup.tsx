import { createFileRoute } from '@tanstack/react-router'
import { SignupForm } from '~/components/auth/SignupForm'
import { AuthLayout } from '~/components/auth/AuthLayout'

export const Route = createFileRoute('/auth/signup')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    }
  },
  component: SignupPage,
})

function SignupPage() {
  return (
    <AuthLayout 
      title="Join the Squad!" 
      subtitle="Create your account and let's get started 🚀"
    >
      <SignupForm />
    </AuthLayout>
  )
}