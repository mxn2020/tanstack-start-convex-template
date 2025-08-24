import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '~/components/auth/LoginForm'
import { AuthLayout } from '~/components/auth/AuthLayout'

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome Back!" 
      subtitle="Sign in to continue your journey 🌟"
    >
      <LoginForm />
    </AuthLayout>
  )
}