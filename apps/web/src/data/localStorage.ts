import { createLogger } from "@/lib/logger";
import { STORAGE_KEYS } from "../constants";
import { ChatRoomMetadata, LocalStorageChatRooms } from "@/types/message";

const logger = createLogger("localStorage");

export const getChatRoomFromLocalStorage = (
  chatId: ChatRoomMetadata["id"],
): ChatRoomMetadata | null => {
  try {
    const data = listChatRoomsFromLocalStorage();
    const chatRoomData = data[chatId];
    if (chatRoomData) {
      return {
        id: chatId,
        ...chatRoomData,
      };
    }
    return null;
  } catch (error) {
    logger.error("Failed to get chat room from localStorage:", error);
    return null;
  }
};

export const saveRoomToChatList = (chat: ChatRoomMetadata) => {
  const chatRooms = listChatRoomsFromLocalStorage();
  chatRooms[chat.id] = {
    name: chat.name,
    createdAt: chat.createdAt,
    lastUpdated: chat.lastUpdated,
    unreadCount: chat.unreadCount,
  }
  try {
    localStorage.setItem(
      `${STORAGE_KEYS.LOCAL_STORAGE_CHATS}`,
      JSON.stringify(chatRooms),
    );
  } catch (error) {
    logger.error("Failed to save chat to localStorage:", error);
  }
};

export const listChatRoomsFromLocalStorage = (): LocalStorageChatRooms => {
  try {
    const data = localStorage.getItem(
      `${STORAGE_KEYS.LOCAL_STORAGE_CHATS}`,
    );
    if (data) {
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    logger.error("Failed to get chat rooms from localStorage:", error);
    return {};
  }
};
