import equal from "fast-deep-equal";
import { memo, useState } from "react";
// import type { ChatMessage } from "@/lib/types";
// import { cn, sanitizeText } from "@/lib/utils";
import { Response } from "../Elements/response";
// import { MessageEditor } from "./message-editor";
// import { PreviewAttachment } from "./preview-attachment";
import { cn } from "@/lib/classname";
import useAuth from "@/hooks/use-auth";
import { MessageContent } from "../Elements/message";
import { Sparkle } from "lucide-react";

interface PreviewMessageProps {
  chatId: string;
  message: any; //ChatMessage;
  isLoading: boolean;
  setMessages: any; //(messages: ChatMessage[]) => void;
  requiresScrollPadding: boolean;
}

const BasePreviewMessage = (props: PreviewMessageProps) => {
  const { chatId, message, isLoading, setMessages } = props;
  const [mode, setMode] = useState<"view" | "edit">("view");
  const { user } = useAuth();

  // const attachmentsFromMessage = message.parts.filter(
  //   (part: any) => part.type === "file",
  // );

  return (
    <div
      className="group/message fade-in w-full animate-in duration-200"
      data-role={message.role}
      data-testid={`message-${message.role}`}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.userId === user?.id && mode !== "edit",
          "justify-start": message.userId !== user?.id,
        })}
      >
        {message.userId !== user?.id && (
          <div className="-mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
            <Sparkle size={14} />
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": mode === "view",
            "w-full": message.userId !== user?.id || mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
          {/* {attachmentsFromMessage.length > 0 && (
            <div
              className="flex flex-row justify-end gap-2"
              data-testid={"message-attachments"}
            >
              {attachmentsFromMessage.map((attachment) => (
                <PreviewAttachment
                  attachment={{
                    name: attachment.filename ?? "file",
                    contentType: attachment.mediaType,
                    url: attachment.url,
                  }}
                  key={attachment.url}
                />
              ))}
            </div>
          )} */}

          <div>
            <MessageContent
              className={cn({
                "wrap-break-word w-fit rounded-2xl px-3 py-1.5 text-right text-white":
                  message.userId === user?.id,
                "bg-transparent px-0 py-0 text-left":
                  message.userId !== user?.id,
              })}
              data-testid="message-content"
              style={
                message.userId === user?.id
                  ? { backgroundColor: "#006cff" }
                  : { backgroundColor: "GrayText"}
              }
            >
              <Response>{message.content}</Response>
            </MessageContent>
          </div>

          {/* {message.content?.map((part: any, index: number) => {
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            if (type === "text") {
              if (mode === "view") {
                return (
                  <div key={key}>
                    <MessageContent
                      className={cn({
                        "wrap-break-word w-fit rounded-2xl px-3 py-2 text-right text-white":
                          message.userId === user?.id,
                        "bg-transparent px-0 py-0 text-left":
                          message.userId !== user?.id,
                      })}
                      data-testid="message-content"
                      style={
                        message.userId === user?.id
                          ? { backgroundColor: "#006cff" }
                          : undefined
                      }
                    >
                      <Response>{part}</Response>
                    </MessageContent>
                  </div>
                );
              }

              if (mode === "edit") {
                return (
                  <div
                    className="flex w-full flex-row items-start gap-3"
                    key={key}
                  >
                    <div className="size-8" />
                    <div className="min-w-0 flex-1">
                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMessages={setMessages}
                        setMode={setMode}
                      />
                    </div>
                  </div>
                );
              }
            }

            return null;
          })} */}

          {/* {!isReadonly && (
            <MessageActions
              chatId={chatId}
              isLoading={isLoading}
              key={`action-${message.id}`}
              message={message}
              setMode={setMode}
              vote={vote}
            />
          )} */}
        </div>
      </div>
    </div>
  );
};

export const PreviewMessage = memo(
  BasePreviewMessage,
  (prevProps, nextProps) => {
    if (
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.message.id === nextProps.message.id &&
      prevProps.requiresScrollPadding === nextProps.requiresScrollPadding &&
      equal(prevProps.message.parts, nextProps.message.parts)
    ) {
      return true;
    }
    return false;
  },
);

export const ThinkingMessage = () => {
  return (
    <div
      className="group/message fade-in w-full animate-in duration-300"
      data-role="assistant"
      data-testid="message-assistant-loading"
    >
      <div className="flex items-start justify-start gap-3">
        <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <div className="animate-pulse">
            <Sparkle size={14} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="flex items-center gap-1 p-0 text-muted-foreground text-sm">
            <span className="animate-pulse">Thinking</span>
            <span className="inline-flex">
              <span className="animate-bounce [animation-delay:0ms]">.</span>
              <span className="animate-bounce [animation-delay:150ms]">.</span>
              <span className="animate-bounce [animation-delay:300ms]">.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
