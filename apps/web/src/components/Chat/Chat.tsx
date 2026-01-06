import { useState } from "react";
import Messages from "./Messages";
import ChatInputWrapper from "../ChatInput/ChatInputWrapper";

interface ChatProps {
  id: string;
  initialMessages?: any[];
}

export default function Chat(props: ChatProps) {
  const { id, initialMessages = [] } = props;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  return (
    <>
      <Messages
        chatId={id}
        status="idle"
        messages={messages}
        setMessages={setMessages}
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
