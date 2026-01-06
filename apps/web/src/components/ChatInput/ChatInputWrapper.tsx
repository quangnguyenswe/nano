import { cn } from "@/lib/classname";
import React, { useCallback, useEffect, useRef } from "react";
import { ChatInput, ChatInputTextarea } from "../Elements/chat-input";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { isMobile } from "@/lib/mobile";
import useAuth from "@/hooks/use-auth";

type ChatInputWrapperProps = {
  className?: string;
  input: string;
  setInput: (input: string) => void;
  messages: any[];
  setMessages: (messages: any[]) => void;
  chatId: string;
};

export default function ChatInputWrapper(props: ChatInputWrapperProps) {
  const { className, input, setInput, messages, setMessages, chatId } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoFocused = useRef(false);
  const { user } = useAuth();

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [adjustHeight]);

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
      textareaRef.current.style.height = "44px";
    }
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const submitForm = useCallback(() => {
    // Update the URL to include the chat ID without reloading the page
    window.history.pushState({}, "", `/chat/${chatId}`);

    //TODO: Implement message sending logic here
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        content: input,
        userId: user?.id,
        createdAt: new Date().toISOString(),
      },
    ]);

    resetHeight();
    setInput("");
    if (!isMobile()) {
      textareaRef.current?.focus();
    }
  }, [chatId, resetHeight, setInput, input]);

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
        className="rounded-xl border border-border bg-background p-1 shadow-xs transition-all duration-200 focus-within:border-border hover:border-muted-foreground/50"
        onSubmit={(_, e) => {
          e.preventDefault();
          if (input.trim().length === 0) {
            return;
          }
          submitForm();
        }}
      >
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
        <div className="flex flex-row items-center gap-1 sm:gap-2">
          <ChatInputTextarea
            className="grow resize-none border-0! border-none! bg-transparent p-1 text-base outline-none! ring-0! [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden"
            data-testid="chat-input-textarea"
            onChange={handleInput}
            placeholder="Send a message..."
            ref={textareaRef}
            rows={1}
            value={input}
          />
          <Button
            type="submit"
            variant="ghost"
            className="rounded-full size-8 hover:bg-accent"
          >
            <span className="sr-only">Send message</span>
            <Send className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </ChatInput>
    </div>
  );
}
