import { useMessages } from "@/hooks/use-messages";
import { ArrowDownIcon } from "lucide-react";
import { memo, useEffect } from "react";
import { PreviewMessage } from "./Message";
import equal from "fast-deep-equal";
import useAuth from "@/hooks/use-auth";
import dayjs from "dayjs";
import { useSocket } from "@/providers/socket";
import { nanoid } from "nanoid";
import { type ChatMessage, MessageStatus, MessageType } from "@/types/message";
import { useAtom } from "@/store/jotai/message-jotai";
import { latestMessageByChatIdAtom } from "@/hooks/use-message-storage";
import { saveChatAttachment } from "@/data/chatAttachments";

interface MessagesProps {
  chatId: string;
  messages: ChatMessage[];
  setMessages: (
    messages: ChatMessage[] | ((msgs: ChatMessage[]) => ChatMessage[]),
  ) => void;
  isLoading: boolean;
}
export default function BaseMessages(props: MessagesProps) {
  const { messages, setMessages, chatId, isLoading } = props;
  const { user } = useAuth();
  const { socket, onMessageUpdate } = useSocket();
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
  } = useMessages();
  const [_, setLatestMessageByChatId] = useAtom(latestMessageByChatIdAtom);

  // Handle incoming messages from other users
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      const attachment = data.attachment
        ? {
            id: data.attachment.id,
            mediaType: data.attachment.mediaType,
            filename: data.attachment.filename,
            dataURL: data.attachment.dataURL,
          }
        : undefined;

      if (attachment?.dataURL) {
        void saveChatAttachment(attachment).catch((error) => {
          console.warn("Failed to save received attachment:", error);
        });
      }

      const newMessage: ChatMessage = {
        id: data.messageId || nanoid(),
        content: data.content,
        userId: data.userId,
        userName: data.userName,
        type: attachment ? MessageType.IMAGE : MessageType.TEXT,
        fileId: attachment?.id,
        attachment,
        timestamp: data.timestamp,
        status: MessageStatus.SENT,
      };
      if (data.chatId === chatId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setLatestMessageByChatId((prev) => ({ ...prev, [chatId]: newMessage }));
      }
    };

    onMessageUpdate(handleNewMessage);

    return () => {
      socket?.off("new-message", handleNewMessage);
    };
  }, [socket, setMessages, chatId]);

  return (
    <div className="relative flex-1">
      <div
        className="absolute inset-0 touch-pan-y overflow-y-auto"
        ref={messagesContainerRef}
      >
        <div className="w-full flex min-w-0 flex-col gap-1 px-2 py-4 md:px-4">
          {messages.length === 0 && <>No messages</>}

          {messages.map((message, index) => {
            const mine = message.userId === user?.id;
            const showAvatar =
              !mine && messages[index + 1]?.userId !== message.userId;
            const showName =
              !mine && messages[index - 1]?.userId !== message.userId;
            const showTimestamp =
              dayjs(message.timestamp).diff(
                dayjs(messages[index - 1]?.timestamp),
                "minutes",
              ) > 10;
            return (
              <PreviewMessage
                chatId={chatId}
                isLoading={isLoading && messages.length - 1 === index}
                key={message.id}
                message={message}
                requiresScrollPadding={index === messages.length - 1}
                setMessages={setMessages}
                mine={mine}
                showAvatar={showAvatar}
                showTimestamp={showTimestamp}
                showName={showName}
              />
            );
          })}

          <div className="min-h-6 min-w-6 shrink-0" ref={messagesEndRef} />
        </div>
      </div>
      <button
        aria-label="Scroll to bottom"
        className={`-translate-x-1/2 absolute bottom-4 left-1/2 z-10 rounded-full border bg-background p-2 shadow-lg transition-all hover:bg-muted ${
          isAtBottom
            ? "pointer-events-none scale-0 opacity-0"
            : "pointer-events-auto scale-100 opacity-100"
        }`}
        onClick={() => scrollToBottom("smooth")}
        type="button"
      >
        <ArrowDownIcon className="size-4" />
      </button>
    </div>
  );
}

export const Messages = memo(BaseMessages, (prevProps, nextProps) => {
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (!equal(prevProps.messages, nextProps.messages)) {
    return false;
  }

  return false;
});
