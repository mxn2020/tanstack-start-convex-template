import { createFileRoute } from '@tanstack/react-router'
import { useSession } from '~/lib/auth-client'
import { Dashboard } from '~/components/Dashboard/Dashboard'
import { Loader } from '~/components/Loader'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  pendingComponent: () => <Loader />,
})

function DashboardPage() {
  const { data: session } = useSession()

  return <Dashboard />
}