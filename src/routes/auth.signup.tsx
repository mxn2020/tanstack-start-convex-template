import { createFileRoute } from '@tanstack/react-router'
import { SignupForm } from '~/components/SignupForm'

export const Route = createFileRoute('/auth/signup')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    }
  },
  component: SignupPage,
})

function SignupPage() {
  return <SignupForm />
}