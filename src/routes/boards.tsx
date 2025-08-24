import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from '~/components/Loader'

export const Route = createFileRoute('/boards')({
  component: BoardsLayout,
  pendingComponent: () => <Loader />,
})

function BoardsLayout() {
  return <Outlet />
}