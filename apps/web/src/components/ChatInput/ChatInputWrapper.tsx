import { cn } from "@/lib/classname";
import React, { useCallback, useEffect, useRef } from "react";
import { ChatInput, ChatInputTextarea } from "../Elements/chat-input";
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

export default function ChatInputWrapper(props: ChatInputWrapperProps) {
  const { className, input, setInput, messages, setMessages, chatId, disabled } = props;
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

  const submitForm = useCallback(() => {
    if (input.trim().length === 0 || disabled) {
      return;
    }
    const messageId = nanoid();
    const timestamp = new Date().toISOString();

    // Add the sender's own message to the UI immediately
    const newMessage = {
      id: messageId,
      content: input,
      userId: user?.id || socket?.id || "", // Use user ID if available, fallback to socket ID
      userName: user?.name || user?.email || "You",
      type: MessageType.TEXT,
      timestamp: Date.now(),
      status: MessageStatus.SENT,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setLatestMessageByChatId((prev) => ({ ...prev, [chatId]: newMessage }));
    emitMessage(messageId, input, timestamp);

    resetHeight();
    setInput("");
    if (!isMobile()) {
      textareaRef.current?.focus();
    }
  }, [
    chatId,
    resetHeight,
    setInput,
    input,
    messages,
    setMessages,
    emitMessage,
    user,
  ]);

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
      {/* <input
        className="-top-4 -left-4 pointer-events-none fixed size-0.5 opacity-0"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        tabIndex={-1}
        type="file"
      /> */}
      <ChatInput
        className="bg-background flex items-end w-full flex-row transition-all duration-200 focus-within:border-border hover:border-muted-foreground/50"
        onSubmit={(_, e) => {
          e.preventDefault();
          if (input.trim().length === 0) {
            return;
          }
          submitForm();
        }}
      >
        <ChatInputUtils disabled={disabled} />
        <div className="flex flex-row items-center gap-1 sm:gap-2 rounded-xl grow border border-border p-1">
          {/* {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div
            className="flex flex-row items-end gap-2 overflow-x-scroll"
            data-testid="attachments-preview"
          >
            {attachments.map((attachment) => (
              <PreviewAttachment
                attachment={attachment}
                key={attachment.url}
                onRemove={() => {
                  setAttachments((currentAttachments) =>
                    currentAttachments.filter((a) => a.url !== attachment.url),
                  );
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              />
            ))}

            {uploadQueue.map((filename) => (
              <PreviewAttachment
                attachment={{
                  url: "",
                  name: filename,
                  contentType: "",
                }}
                isUploading={true}
                key={filename}
              />
            ))}
          </div>
        )} */}
          <ChatInputTextarea
            className="grow resize-none border-0! border-none! bg-transparent p-1 text-base outline-none! ring-0! [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden"
            data-testid="chat-input-textarea"
            onChange={handleInput}
            placeholder="Send a message..."
            ref={textareaRef}
            rows={1}
            disabled={disabled}
            value={input}
          />
          <div className="flex self-end">
            <Button
              type="submit"
              variant="ghost"
              disabled={input.trim().length === 0 || disabled}
              className="rounded-full size-8 hover:bg-accent"
            >
              <span className="sr-only">Send message</span>
              <Send className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Button>
          </div>
        </div>
      </ChatInput>
    </div>
  );
}
