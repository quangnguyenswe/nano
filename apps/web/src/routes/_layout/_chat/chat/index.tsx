import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/_chat/chat/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_layout/_chat/chat/"!</div>
}
