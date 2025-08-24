import { createFileRoute } from '@tanstack/react-router'
import { useSession } from '~/lib/auth-client'
import { Yallas } from '~/components/Yallas/Yallas'
import { Loader } from '~/components/Loader'

export const Route = createFileRoute('/yallas')({
  component: YallasPage,
  pendingComponent: () => <Loader />,
})

function YallasPage() {
  const { data: session } = useSession()

  return <Yallas />
}