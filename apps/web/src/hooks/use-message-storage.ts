import type { MessagePersistenceAdapter } from "@/data/messageStorage";
import { atom, useAtom } from "@/store/jotai/message-jotai";
import { ChatMessage } from "@/types/message";
import { useCallback, useEffect, useRef } from "react";

interface UseMessageStorageProps {
  messagePersistenceAdapter: MessagePersistenceAdapter;
  chatId: string;
}

export const savedMessagesAtom = atom<ChatMessage[]>([]);
export const isLoadingMessagesAtom = atom<boolean>(false);

export const useMessageStorage = ({
  messagePersistenceAdapter,
  chatId,
}: UseMessageStorageProps) => {
  // use jotai store to get and set messages
  const [messages, setMessages] = useAtom(savedMessagesAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingMessagesAtom);

  const messageRef = useRef(messages);
  messageRef.current = messages;

  const loadMessages = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const messages = await messagePersistenceAdapter.loadMessages(chatId);
      setMessages(messages);
    } catch (error) {
      console.warn("Failed to load messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messagePersistenceAdapter, setMessages, setIsLoading, chatId]);

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  const saveMessages = useCallback(async () => {
    if (messages.length === 0) return;
    try {
      await messagePersistenceAdapter.saveMessages(chatId, messages);
    } catch (error) {
      console.warn("Failed to save messages:", error);
    }
  }, [messagePersistenceAdapter, chatId, messages]);

  useEffect(() => {
    saveMessages();
  }, [messages.length]);

  const clearMessages = useCallback(async () => {
    try {
      await messagePersistenceAdapter.clearMessages(chatId);
      setMessages([]);
    } catch (error) {
      console.warn("Failed to clear messages:", error);
    }
  }, [messagePersistenceAdapter, chatId, setMessages]);

  return {
    isLoading,
    loadMessages,
    saveMessages,
    clearMessages,
  };
};
