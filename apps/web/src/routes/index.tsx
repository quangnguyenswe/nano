import Navigation from "@/components/Navigation/Navigation";
import { getLatestChatRoom } from "@/data/localStorage";
import { createFileRoute, redirect } from "@tanstack/react-router";

// If user is authenticated, redirect to their latest chat or to create a new chat
// Otherwise, show the home page
export const Route = createFileRoute("/")({
  component: Index,
  beforeLoad: async ({ context }) => {
    const latestChatRoom = getLatestChatRoom();
    if (context.user) {
      if (latestChatRoom) {
        throw redirect({
          to: "/chat/$chatId",
          params: { chatId: latestChatRoom.id },
        });
      } else {
        throw redirect({
          to: "/chat/new",
        });
      }
    }
  },
});

function Index() {
  return (
    <>
      <Navigation />
      <h3>Welcome Home!</h3>
    </>
  );
}
