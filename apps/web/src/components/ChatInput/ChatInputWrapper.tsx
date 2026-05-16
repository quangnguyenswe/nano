import { cn } from "@/lib/classname";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ChatInput,
  ChatInputAttachment,
  ChatInputAttachments,
  ChatInputTextarea,
  type ChatInputMessage,
  useChatInputAttachments,
} from "../Elements/chat-input";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { isMobile } from "@/lib/mobile";
import useAuth from "@/hooks/use-auth";
import { useSocket } from "@/providers/socket";
import { nanoid } from "nanoid";
import { ChatMessage, MessageStatus, MessageType } from "@/types/message";
import ChatInputUtils from "./ChatInputUtils";
import { useAtom } from "@/store/jotai/message-jotai";
import { latestMessageByChatIdAtom } from "@/hooks/use-message-storage";
import { saveChatAttachment } from "@/data/chatAttachments";

type ChatInputWrapperProps = {
  className?: string;
  input: string;
  setInput: (input: string) => void;
  messages: ChatMessage[];
  setMessages: (
    messages: ChatMessage[] | ((msgs: ChatMessage[]) => ChatMessage[]),
  ) => void;
  chatId: string;
  disabled?: boolean;
};

function ChatInputComposerBody({
  input,
  disabled,
  onInputChange,
}: {
  input: string;
  disabled?: boolean;
  onInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const attachments = useChatInputAttachments();
  const canSubmit = input.trim().length > 0 || attachments.files.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-2 rounded-xl border border-border p-1">
      <ChatInputAttachments className="flex max-w-full flex-wrap items-center gap-2 overflow-x-auto px-1 pt-1">
        {(attachment) => <ChatInputAttachment data={attachment} />}
      </ChatInputAttachments>

      <div className="flex flex-row items-center gap-1 sm:gap-2">
        <ChatInputTextarea
          className="grow resize-none border-0! border-none! bg-transparent p-1 text-base outline-none! ring-0! [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden"
          data-testid="chat-input-textarea"
          onChange={onInputChange}
          placeholder="Send a message..."
          rows={1}
          disabled={disabled}
          value={input}
        />
        <div className="flex self-end">
          <Button
            type="submit"
            variant="ghost"
            disabled={disabled || !canSubmit}
            className="rounded-full size-8 hover:bg-accent"
          >
            <span className="sr-only">Send message</span>
            <Send className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatInputWrapperContent(props: ChatInputWrapperProps) {
  const { className, input, setInput, setMessages, chatId, disabled } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoFocused = useRef(false);
  const [_, setLatestMessageByChatId] = useAtom(latestMessageByChatIdAtom);

  const { socket, emitMessage } = useSocket();
  const { user } = useAuth();

  // const fileInputRef = useRef<HTMLInputElement>(null);
  // const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  // const [attachments, setAttachments] = useState<{ url: string; name: string; contentType: string }[]>([]);

  useEffect(() => {
    if (!hasAutoFocused.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        hasAutoFocused.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const resetHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const submitForm = useCallback(
    async ({ text, files }: ChatInputMessage) => {
      if (disabled || (text.trim().length === 0 && files.length === 0)) {
        return;
      }

      const messageId = nanoid();
      const timestamp = Date.now();
      const attachment = files[0]
        ? {
            id: files[0].id,
            mediaType: files[0].mediaType,
            filename: files[0].filename,
            dataURL: files[0].url,
          }
        : undefined;

      if (attachment) {
        void saveChatAttachment(attachment).catch((error) => {
          console.warn("Failed to save chat attachment to IndexedDB:", error);
        });
      }

      const newMessage: ChatMessage = {
        id: messageId,
        content: text,
        userId: user?.id || socket?.id || "",
        userName: user?.name || user?.email || "You",
        type: attachment ? MessageType.IMAGE : MessageType.TEXT,
        fileId: attachment?.id,
        attachment,
        timestamp,
        status: MessageStatus.SENT,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setLatestMessageByChatId((prev) => ({ ...prev, [chatId]: newMessage }));
      emitMessage(chatId, {
        messageId,
        content: text,
        timestamp,
        attachment,
      });

      resetHeight();
      setInput("");
      if (!isMobile()) {
        textareaRef.current?.focus();
      }
    },
    [
      chatId,
      disabled,
      emitMessage,
      resetHeight,
      setInput,
      setMessages,
      socket?.id,
      user,
    ],
  );

  // const uploadFile = useCallback(async (file: File) => {
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const response = await fetch("/api/upload", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       const { url, pathname, contentType } = data;

  //       return {
  //         url,
  //         name: pathname,
  //         contentType,
  //       };
  //     }
  //     const { error } = await response.json();
  //     toast.error(error);
  //     return;
  //   } catch (_error) {
  //     toast.error("Failed to upload file, please try again!");
  //   }
  // }, []);

  // const handleFileChange = useCallback(
  //   async (event: ChangeEvent<HTMLInputElement>) => {
  //     const files = Array.from(event.target.files || []);

  //     setUploadQueue(files.map((file) => file.name));

  //     try {
  //       const uploadPromises = files.map((file) => uploadFile(file));
  //       const uploadedAttachments = await Promise.all(uploadPromises);
  //       const successfullyUploadedAttachments = uploadedAttachments.filter(
  //         (attachment) => attachment !== undefined
  //       );

  //       setAttachments((currentAttachments) => [
  //         ...currentAttachments,
  //         ...successfullyUploadedAttachments,
  //       ]);
  //     } catch (_error) {
  //       toast.error("Failed to upload files");
  //     } finally {
  //       setUploadQueue([]);
  //     }
  //   },
  //   [setAttachments, uploadFile]
  // );

  return (
    <div className={cn("relative flex w-full flex-col gap-4", className)}>
      <ChatInput
        accept="image/*"
        className="bg-background flex items-end w-full flex-row transition-all duration-200 focus-within:border-border hover:border-muted-foreground/50"
        multiple={false}
        onSubmit={async ({ text, files }) => {
          await submitForm({ text, files });
        }}
      >
        <ChatInputUtils disabled={disabled} />
        <ChatInputComposerBody
          disabled={disabled}
          input={input}
          onInputChange={handleInput}
        />
      </ChatInput>
    </div>
  );
}

export default function ChatInputWrapper(props: ChatInputWrapperProps) {
  return <ChatInputWrapperContent {...props} />;
}
