import { createFileRoute } from "@tanstack/react-router";
import Chat from "@/components/Chat/Chat";
import { v4 as uuidv4 } from 'uuid';

export const Route = createFileRoute("/_layout/_chat/chat/")({
  component: RouteComponent,
});

function RouteComponent() {
  const id = uuidv4();
  return (
    <Chat
      id={id}
      initialMessages={[]}
    />
  );
}
