import { useState } from "react";
import Messages from "./Messages";
import ChatInputWrapper from "../ChatInput/ChatInputWrapper";
// import { ChatMessage } from "@/types/message";
import { useAtom } from "@/store/jotai/message-jotai";
import {
  savedMessagesAtom,
  useMessageStorage,
} from "@/hooks/use-message-storage";
import { IndexedDBAdapter } from "@/data/messageStorage";

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
