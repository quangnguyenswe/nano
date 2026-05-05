import equal from "fast-deep-equal";
import { memo, useState } from "react";
// import { cn, sanitizeText } from "@/lib/utils";
import { Response } from "../Elements/response";
// import { MessageEditor } from "./message-editor";
// import { PreviewAttachment } from "./preview-attachment";
import { cn } from "@/lib/classname";
import { MessageContent } from "../Elements/message";
import { Sparkle } from "lucide-react";
import dayjs from "dayjs";
import { ChatMessage } from "@/types/message";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface PreviewMessageProps {
  chatId: string;
  message: ChatMessage;
  isLoading: boolean;
  setMessages: (messages: ChatMessage[]) => void; //
  requiresScrollPadding: boolean;
  mine: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  showName: boolean;
}

const BasePreviewMessage = (props: PreviewMessageProps) => {
  const {
    chatId,
    message,
    isLoading,
    setMessages,
    showAvatar,
    mine,
    showTimestamp,
    showName,
  } = props;
  const [mode, setMode] = useState<"view" | "edit">("view");

  // const attachmentsFromMessage = message.parts.filter(
  //   (part: any) => part.type === "file",
  // );

  return (
    <div className="group/message fade-in w-full animate-in duration-200">
      {showTimestamp && (
        <div className="flex items-center justify-center gap-3 font-bold text-gray-500 text-xs">
          {dayjs(message.timestamp).format("h:mm A")}
        </div>
      )}

      <div>
        {showName && (
          <div className="ml-10 pl-1.5 pb-0.5 text-xs text-gray-500 w-fit">
            {message.userName || "User"}
          </div>
        )}
        <div
          className={cn("flex w-full items-center gap-2 md:gap-3", {
            "justify-end": mine,
            "justify-start": !mine,
          })}
        >
          {showAvatar && (
            <Avatar className="h-7 w-7 rounded-full bg-background ring-1 ring-border">
              <AvatarImage
                className="bg-white"
                src={"/images/default-avatar.png"}
                alt={message.userName || "User"}
              />
              <AvatarFallback className="rounded-lg text-xs">
                {message.userName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          )}
          {!showAvatar && !mine && <div className="size-7" />}

          <div
            className={cn("flex flex-col", {
              "gap-2 md:gap-4": mode === "view",
              "w-full": mode === "edit",
              "max-w-[calc(100%-5rem)] sm:max-w-[min(fit-content,80%)]":
                mode !== "edit",
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
                className={cn("px-3 py-1.5 wrap-break-word w-fit rounded-lg", {
                  "bg-brand text-right text-white": mine,
                  "bg-muted dark:bg-muted-foreground text-left": !mine,
                })}
                data-testid="message-content"
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
      prevProps.showAvatar === nextProps.showAvatar &&
      prevProps.showName === nextProps.showName &&
      prevProps.showTimestamp === nextProps.showTimestamp &&
      equal(prevProps.message, nextProps.message)
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
