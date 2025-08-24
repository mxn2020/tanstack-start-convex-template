import { createFileRoute } from '@tanstack/react-router'
import { Circles } from '~/components/Circles/Circles'
import { Loader } from '~/components/Loader'

export const Route = createFileRoute('/circles')({
  component: CirclesPage,
  pendingComponent: () => <Loader />,
})

function CirclesPage() {
  return (
      <Circles />
  )
}