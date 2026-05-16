import { createStore, get, set, del, keys } from "idb-keyval";

import type { ChatMessage } from "@/types/message";

import { STORAGE_KEYS } from "@/constants";
import { deleteChatAttachments } from "./chatAttachments";

export interface MessagePersistenceAdapter {
  /**
   * Load saved messages from storage.
   */
  loadMessages: (chatRoomId: string) => Promise<ChatMessage[]>;

  /**
   * Save messages to storage.
   */
  saveMessages: (chatRoomId: string, messages: ChatMessage[]) => Promise<void>;

  /**
   * Clear messages from storage.
   */
  clearMessages: (chatRoomId: string) => Promise<void>;

  /**
   * Get the latest message from all chat rooms. This is used to show a preview of the last message in the chat history sidebar.
   * The implementation can choose how to store and retrieve this information efficiently.
   */
  getLatestMessage: () => Promise<Record<string, ChatMessage | null>>;
}

const stripAttachmentDataURL = (message: ChatMessage): ChatMessage => {
  if (!message.attachment?.dataURL) {
    return message;
  }

  const { dataURL: _dataURL, ...attachment } = message.attachment;

  return {
    ...message,
    attachment,
  };
};

const getMessageAttachmentIds = (messages: ChatMessage[]) => {
  const attachmentIds = new Set<string>();

  for (const message of messages) {
    const attachmentId = message.attachment?.id || message.fileId;
    if (attachmentId) {
      attachmentIds.add(attachmentId);
    }
  }

  return [...attachmentIds];
};

// storage name gonna be "nano_idb_messages" + chatRoomId
export class IndexedDBAdapter {
  private static idb_name = STORAGE_KEYS.IDB_MESSAGES;

  private static store = createStore(
    `${IndexedDBAdapter.idb_name}_db`,
    `${IndexedDBAdapter.idb_name}_store`,
  );

  /**
   * Load saved messages from IndexedDB.
   * @returns Promise resolving to saved messages array (empty if none found)
   */
  static async loadMessages(chatRoomId: string): Promise<ChatMessage[]> {
    try {
      const data = await get<ChatMessage[]>(chatRoomId, IndexedDBAdapter.store);
      return data ?? [];
    } catch (error) {
      console.warn("Failed to load messages from IndexedDB:", error);
      return [];
    }
  }

  /**
   * Save messages to IndexedDB.
   * @param chatRoomId - The ID of the chat room.
   * @param messages - The array of chat messages to save.
   */
  static async saveMessages(
    chatRoomId: string,
    messages: ChatMessage[],
  ): Promise<void> {
    try {
      const storedMessages = messages.map(stripAttachmentDataURL);
      await set(chatRoomId, storedMessages, IndexedDBAdapter.store);
    } catch (error) {
      console.warn("Failed to save messages to IndexedDB:", error);
      throw error;
    }
  }

  static async clearMessages(chatRoomId: string): Promise<void> {
    try {
      const messages = await this.loadMessages(chatRoomId);
      await del(chatRoomId, IndexedDBAdapter.store);
      await deleteChatAttachments(getMessageAttachmentIds(messages));
    } catch (error) {
      console.warn("Failed to clear messages from IndexedDB:", error);
      throw error;
    }
  }

  static async getLatestMessage(): Promise<Record<string, ChatMessage | null>> {
    try {
      const allKeys = await keys(IndexedDBAdapter.store);
      const latestMessages: Record<string, ChatMessage | null> = {};
      for (const key of allKeys) {
        const messages = await get<ChatMessage[]>(key, IndexedDBAdapter.store);
        const keyString = String(key);
        if (messages && messages.length > 0) {
          latestMessages[keyString] = messages[messages.length - 1];
        } else {
          latestMessages[keyString] = null;
        }
      }
      return latestMessages;
    } catch (error) {
      console.warn("Failed to get latest messages from IndexedDB:", error);
      return {};
    }
  }
}
