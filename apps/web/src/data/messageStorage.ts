import { createStore, get, set, del } from "idb-keyval";

import type { ChatMessage } from "@/types/message";

import { STORAGE_KEYS } from "@/constants";

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
}

// storage name gonna be "huddle_idb_messages" + chatRoomId
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
      await set(chatRoomId, messages, IndexedDBAdapter.store);
    } catch (error) {
      console.warn("Failed to save messages to IndexedDB:", error);
      throw error;
    }
  }

  static async clearMessages(chatRoomId: string): Promise<void> {
    try {
      await del(chatRoomId, IndexedDBAdapter.store);
    } catch (error) {
      console.warn("Failed to clear messages from IndexedDB:", error);
      throw error;
    }
  }
}
