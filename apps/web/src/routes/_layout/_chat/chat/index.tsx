import { createFileRoute } from "@tanstack/react-router";
import Chat from "@/components/Chat/Chat";

export const Route = createFileRoute("/_layout/_chat/chat/")({
  component: RouteComponent,
});

function RouteComponent() {
  
  return (
    <Chat
      id="chat-id-placeholder"
      initialMessages={[]}
    />
  );
}
