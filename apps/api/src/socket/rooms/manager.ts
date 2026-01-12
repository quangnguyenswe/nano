import type { Server } from "socket.io";
import { logger } from "../../logger";
import { timestamp } from "drizzle-orm/gel-core";

export interface UserPresence {
  userId: string;
  chatId: string;
  userName: string;
  socketId: string;
  joinedAt: number;
  lastActivity: number;
  avatarUrl?: string | null;
}

export interface ChatRoom {
  chatId: string;
  users: Map<string, UserPresence>; // socketId -> UserPresence
  lastModified: number;
  activeConnections: number;
}

export class RoomManager {
  private chatRooms = new Map<string, ChatRoom>();
  private socketToChat = new Map<string, string>(); // socketId -> chatId
  private userSessions = new Map<
    string,
    { userId: string; userName: string; avatarUrl?: string | null }
  >();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  createChatRoom(chatId: string): ChatRoom {
    return {
      chatId,
      users: new Map<string, UserPresence>(),
      lastModified: Date.now(),
      activeConnections: 0,
    };
  }

  cleanupUserFromRoom(socketId: string, chatId: string) {
    const room = this.chatRooms.get(chatId);

    if (room) {
      room.users.delete(socketId);
      room.activeConnections = Math.max(0, room.activeConnections - 1);

      if (room.activeConnections === 0) {
        this.chatRooms.delete(chatId);
        logger.info(
          `Chat room ${chatId} deleted due to no active connections.`,
        );
      }
    }
    this.socketToChat.delete(socketId);
    this.userSessions.delete(socketId);
  }

  handleChatRoomDeletion(chatId: string) {
    const room = this.chatRooms.get(chatId);
    if (!room) return;

    this.io.to(chatId).emit("chat_room_deleted", {
      chatId,
      timestamp: Date.now(),
    });
    const socketsToDisconnect: string[] = [];
    room.users.forEach((_presence, socketId) => {
      socketsToDisconnect.push(socketId);
    });

    socketsToDisconnect.forEach((socketId) => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(chatId);
      }
      this.cleanupUserFromRoom(socketId, chatId);
    });

    this.chatRooms.delete(chatId);
  }

  getChatRooms(): ReadonlyMap<string, ChatRoom> {
    return this.chatRooms;
  }
  getSocketToChat(): ReadonlyMap<string, string> {
    return this.socketToChat;
  }
  getUserSessions(): ReadonlyMap<string, { userId: string; userName: string }> {
    return this.userSessions;
  }
  hasChatRoom(chatId: string): boolean {
    return this.chatRooms.has(chatId);
  }
  getChatRoom(chatId: string): ChatRoom | undefined {
    return this.chatRooms.get(chatId);
  }
  setChatRoom(chatId: string, room: ChatRoom): void {
    this.chatRooms.set(chatId, room);
  }
  getUserSession(
    socketId: string,
  ):
    | { userId: string; userName: string; avatarUrl?: string | null }
    | undefined {
    return this.userSessions.get(socketId);
  }

  getChatroomIdForSocket(socketId: string): string | undefined {
    return this.socketToChat.get(socketId)
  }

  setChatroomForSocket(socketId: string, chatId: string): void {
    this.socketToChat.set(socketId, chatId)
  }

  setUserSession(
    socketId: string,
    session: { userId: string; userName: string; avatarUrl?: string | null },
  ): void {
    this.userSessions.set(socketId, session);
  }
  getTotalActiveConnections(): number {
    return Array.from(this.chatRooms.values()).reduce(
      (total, room) => total + room.activeConnections,
      0,
    );
  }

  emitToChatRoom<T = unknown>(chatId: string, event: string, data: T): void {
    this.io.to(chatId).emit(event, data);
  }

  /**
   * Get the number of unique users in a chat room
   * (not the number of socket connections)
   */
  getUniqueUserCount(chatId: string): number {
    const room = this.chatRooms.get(chatId);
    if (!room) return 0;

    const uniqueUsers = new Set<string>();
    room.users.forEach((presence) => {
      uniqueUsers.add(presence.userId);
    });

    return uniqueUsers.size;
  }
}
