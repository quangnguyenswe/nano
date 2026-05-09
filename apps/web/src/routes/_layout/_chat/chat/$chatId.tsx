import Chat from "@/components/Chat/Chat";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_chat/chat/$chatId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { chatId } = Route.useParams();

  // const messagesFromDb = await getMessagesByChatId({
  //   id: chatId,
  // });

  // const uiMessages = convertToUIMessages(messagesFromDb);

  return <Chat id={chatId} />;
}
