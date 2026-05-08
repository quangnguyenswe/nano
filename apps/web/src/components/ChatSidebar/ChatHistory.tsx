import { motion } from "framer-motion";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChatHistoryItem } from "./ChatHistoryItem";
import { useNavigate, useParams } from "@tanstack/react-router";
import { User } from "better-auth/types";
import { useMessageStorage } from "@/hooks/use-message-storage";
import { IndexedDBAdapter } from "@/data/messageStorage";
import { ChatHistory } from "@/types/chat-room";
import useSWRInfinite from "swr/infinite";
import { httpDelete, httpGet, httpPost } from "@/api/http";
import { LoaderIcon } from "lucide-react";
import { WINDOW_EVENTS } from "@/constants";

const PAGE_SIZE = 20;

export const getChatHistoryPaginationKey = (
  pageIndex: number,
  previousPageData: ChatHistory | null,
) => {
  if (previousPageData && previousPageData.hasMore === false) {
    return null;
  }

  if (pageIndex === 0) {
    return `/chat-room/history?limit=${PAGE_SIZE}`;
  }

  const firstChatFromPage = previousPageData?.chats.at(-1);

  if (!firstChatFromPage) {
    return null;
  }

  return `/chat-room/history?limit=${PAGE_SIZE}&endingBefore=${firstChatFromPage.id}`;
};

export const fetcher = async (url: string): Promise<ChatHistory> => {
  const { response, error } = await httpGet(url);
  if (error || !response) {
    throw new Error(error?.message || "Failed to fetch chat history");
  }
  return response as ChatHistory;
};

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const params = useParams({ strict: false });
  const id = params ? params.chatId : null;

  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [leaveId, setLeaveId] = useState<string | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const {
    data: paginatedChatHistories,
    setSize,
    isValidating,
    isLoading,
    mutate,
  } = useSWRInfinite<ChatHistory>(
    user ? getChatHistoryPaginationKey : () => null,
    fetcher,
    { fallbackData: [], revalidateOnFocus: false },
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      const newChat = custom.detail;

      if (!newChat) return;

      mutate((pages) => {
        if (!pages) return pages;

        // avoid duplicates
        const alreadyExists = pages.some((page) =>
          page.chats.some((c) => c.id === newChat.id),
        );
        if (alreadyExists) return pages;

        const newPages = [...pages];

        if (newPages.length === 0) {
          newPages.push({ chats: [newChat], hasMore: true });
        } else {
          newPages[0] = {
            ...newPages[0],
            chats: [newChat, ...newPages[0].chats],
          };
        }

        return newPages;
      }, false);
    };

    window.addEventListener(WINDOW_EVENTS.CHAT_CREATED, handler);

    return () =>
      window.removeEventListener(WINDOW_EVENTS.CHAT_CREATED, handler);
  }, [mutate]);

  const { clearMessages } = useMessageStorage({
    messagePersistenceAdapter: IndexedDBAdapter,
    chatId: id!,
  });

  const hasReachedEnd = paginatedChatHistories
    ? paginatedChatHistories.some((page) => page.hasMore === false)
    : false;

  const hasEmptyChatHistory = paginatedChatHistories
    ? paginatedChatHistories.every((page) => page.chats.length === 0)
    : false;

  const handleDelete = async () => {
    const chatToDelete = deleteId;
    const isCurrentChat = chatToDelete === id;

    setShowDeleteDialog(false);

    const { response, error } = await httpDelete(
      `/chat-room/delete/${chatToDelete}`,
    );

    if (error || !response) {
      toast.error(error?.message || "Failed to delete chat room");
      return;
    }

    await clearMessages();

    if (isCurrentChat) {
      navigate({ to: "/chat" });
    }

    mutate((chatHistories) => {
      if (!chatHistories) return chatHistories;

      return chatHistories.map((chatHistory) => ({
        ...chatHistory,
        chats: chatHistory.chats.filter((chat) => chat.id !== chatToDelete),
      }));
    });
  };

  const handleLeave = async () => {
    const chatToLeave = leaveId;
    const isCurrentChat = chatToLeave === id;

    setShowLeaveDialog(false);

    const { response, error } = await httpPost(
      `/chat-room/leave/${chatToLeave}`,
      {},
    );

    if (error || !response) {
      toast.error(error?.message || "Failed to leave chat room");
      return;
    }

    if (isCurrentChat) {
      navigate({ to: "/chat" });
    }

    mutate((chatHistories) => {
      if (!chatHistories) return chatHistories;

      return chatHistories.map((chatHistory) => ({
        ...chatHistory,
        chats: chatHistory.chats.filter((chat) => chat.id !== chatToLeave),
      }));
    });
  };

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
            Login to save and revisit previous chats!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-primary text-xs">Today</div>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                className="flex h-8 items-center gap-2 rounded-md px-2"
                key={item}
              >
                <div
                  className="h-4 max-w-(--skeleton-width) flex-1 rounded-md bg-sidebar-accent-foreground/10"
                  style={
                    {
                      "--skeleton-width": `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (hasEmptyChatHistory) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
          History
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-[13px] text-sidebar-foreground/90">
            Your conversations will appear here once you start chatting!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      <SidebarGroup className="px-1">
        <SidebarGroupContent>
          <SidebarMenu>
            {paginatedChatHistories &&
              (() => {
                const chatsFromHistory = paginatedChatHistories.flatMap(
                  (paginatedChatHistory) => paginatedChatHistory.chats,
                );

                return (
                  <div className="flex flex-col gap-6 text-primary">
                    {chatsFromHistory.length > 0 && (
                      <div>
                        {chatsFromHistory.map((chat) => (
                          <ChatHistoryItem
                            chat={chat}
                            isActive={chat.id === id}
                            key={chat.id}
                            onDelete={(chatId: string) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                            onLeave={(chatId: string) => {
                              setLeaveId(chatId);
                              setShowLeaveDialog(true);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
          </SidebarMenu>

          <motion.div
            onViewportEnter={() => {
              if (!isValidating && !hasReachedEnd) {
                setSize((size) => size + 1);
              }
            }}
          />

          {hasReachedEnd ? null : (
            <div className="mt-1 flex flex-row items-center gap-2 px-4 py-2 text-primary">
              <div className="animate-spin">
                <LoaderIcon />
              </div>
              <div className="text-[11px]">Loading...</div>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog onOpenChange={setShowLeaveDialog} open={showLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              After leaving, you will lose access to this chat and all its
              messages. You can ask the room owner to re-add you if you change
              your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeave}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
