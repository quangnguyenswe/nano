import Chat from "@/components/Chat/Chat";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_chat/chat/$chatId")({
  component: RouteComponent,
  beforeLoad: async (context) => {
    const { chatId } = context.params;
    // const chat = await getChatById({ id: chatId });
    // if (!chat) {
    //   context.navigate({ to: "/chat" });
    // }
  },
});

function RouteComponent() {
  const { chatId } = Route.useParams();

  // const messagesFromDb = await getMessagesByChatId({
  //   id: chatId,
  // });

  // const uiMessages = convertToUIMessages(messagesFromDb);

  return <Chat id={chatId} />;
}
