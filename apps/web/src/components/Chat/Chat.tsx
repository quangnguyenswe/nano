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
import { httpGet, httpPost } from "@/api/http";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { MembershipRole, useMembershipStore } from "@/store/membership";

interface ChatProps {
  id: string;
}

export default function Chat(props: ChatProps) {
  const { id } = props;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useAtom(savedMessagesAtom);
  const { isLoading, getLatestMessage } = useMessageStorage({
    messagePersistenceAdapter: IndexedDBAdapter,
    chatId: id,
  });
  const [membership, setMembership] = useState<string>("guest");
  const navigate = useNavigate();
  const { setRole } = useMembershipStore();
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

  // Check if user has access to the chat room, if not open a dialog to request access
  const getMembershipStatus = async () => {
    if (!id) {
      return;
    }
    const { response, error } = await httpGet<{
      status: string;
      role: MembershipRole | null;
    }>(`/membership/status/${id}`);
    if (error || !response) {
      toast.error(error?.message || "Failed to check chat room access");
      return;
    }
    setMembership(response.status);
    setRole(response.role as MembershipRole);

    if (response.status === "guest") {
      toast.error("You do not have access to this chat room");
    }
  };

  const handleRequestAccess = async () => {
    const { response, error } = await httpPost(
      `/membership/request-access/${id}`,
    );
    if (error || !response) {
      toast.error(error?.message || "Failed to request access");
      return;
    }
    setMembership("pending");
    toast.success("Access request sent successfully");
  };

  useEffect(() => {
    getMembershipStatus();
  }, [id]);

  useEffect(() => {
    if (isLoading) return;
    getLatestMessage();
  }, [getLatestMessage]);

  return (
    <>
      {membership === "joined" ? (
        <Messages
          chatId={id}
          messages={messages}
          setMessages={setMessages}
          isLoading={isLoading}
        />
      ) : membership === "none" ? (
        <div className="relative flex-1 flex items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <img
                  className="w-40 md:w-52"
                  alt=""
                  src="/illustrates/invite-only.svg"
                />
              </EmptyMedia>
              <EmptyTitle>Access Denied</EmptyTitle>
              <EmptyDescription>
                It looks like you don't have permission to access this chat
                room. Please request access from the chat room owner.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button size="sm" onClick={handleRequestAccess}>
                Request
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ to: "/chat" })}
              >
                Back to Chats
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="relative flex-1 flex items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <img
                  className="w-40 md:w-52"
                  alt=""
                  src="/illustrates/pending-request.svg"
                />
              </EmptyMedia>
              <EmptyTitle>Pending Approval</EmptyTitle>
              <EmptyDescription>
                Your request to access this chat room is pending approval from
                the owner.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
      <div className="sticky bottom-0 z-1 flex w-full gap-2 border-t-0 bg-background px-2 pb-3 md:pr-4 md:pb-4 pt-1 md:pt-2">
        <ChatInputWrapper
          input={input}
          setInput={setInput}
          messages={messages}
          disabled={membership !== "joined"}
          setMessages={setMessages}
          chatId={id}
        />
      </div>
    </>
  );
}
