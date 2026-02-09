import { useEffect, useState } from "react";
import Messages from "./Messages";
import ChatInputWrapper from "../ChatInput/ChatInputWrapper";
// import { ChatMessage } from "@/types/message";
import { useAtom } from "@/store/jotai/message-jotai";
import {
  savedMessagesAtom,
  useMessageStorage,
} from "@/hooks/use-message-storage";
import { IndexedDBAdapter } from "@/data/messageStorage";
import { saveRoomToChatList } from "@/data/localStorage";
import { useSocket } from "@/providers/socket";

interface ChatProps {
  id: string;
}

export default function Chat(props: ChatProps) {
  const { id } = props;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useAtom(savedMessagesAtom);
  const { isLoading } = useMessageStorage({
    messagePersistenceAdapter: IndexedDBAdapter,
    chatId: id,
  });
  // const { socket, onChatRoomDetailsUpdate, emitChatRoomDetails } = useSocket();

  // useEffect(() => {
  //   // When a new user joins the room, share our local room details with them
  //   socket?.on("user-joined", (data: { chatId: string }) => {
  //     if (data.chatId === id) {
  //       emitChatRoomDetails(id);
  //     }
  //   });

  //   // When we receive room details from another user, save them locally
  //   const handleChatDetailsUpdate = (data: any) => {
  //     if (data.details && data.chatId === id) {
  //       console.log("Received chat room details:", data);
  //       saveRoomToChatList({
  //         id: data.chatId,
  //         name: data.details.name,
  //         creator: data.details.creator,
  //         createdAt: data.details.createdAt,
  //         lastUpdated: data.details.lastUpdated,
  //         unreadCount: data.details.unreadCount || 0,
  //       });
  //     }
  //   };

  //   onChatRoomDetailsUpdate(handleChatDetailsUpdate);

  //   return () => {
  //     socket?.off("user-joined");
  //     socket?.off("chat-room-details", handleChatDetailsUpdate);
  //   };
  // }, [socket, setMessages, id]);

  return (
    <>
      <Messages
        chatId={id}
        messages={messages}
        setMessages={setMessages}
        isLoading={isLoading}
      />
      <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4 pt-1 md:pt-2">
        <ChatInputWrapper
          input={input}
          setInput={setInput}
          messages={messages}
          setMessages={setMessages}
          chatId={id}
        />
      </div>
    </>
  );
}
