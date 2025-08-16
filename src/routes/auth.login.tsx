import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '~/components/LoginForm'

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return <LoginForm />
}