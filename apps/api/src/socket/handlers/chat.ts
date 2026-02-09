import { db } from "../../db";
import { user } from "../../db/schema";
import { logger } from "../../logger";
import { eq } from "drizzle-orm";
import type { AuthenticatedSocket } from "../middleware/auth";
import type { RoomManager, UserPresence } from "../rooms/manager";

export interface HandlerDependencies {
  roomManager: RoomManager;
}

export const createChatRoom = (chatId: string) => ({
  chatId,
  users: new Map(),
  lastModified: Date.now(),
  activeConnection: 0,
});

export const cleanUserFromRoom = (
  socketId: string,
  chatId: string,
  roomManager: RoomManager,
) => {
  roomManager.cleanupUserFromRoom(socketId, chatId);
};

export function setupChatHandlers(
  socket: AuthenticatedSocket,
  deps: HandlerDependencies | RoomManager,
) {
  const roomManager =
    deps instanceof Object && "roomManager" in deps
      ? deps.roomManager
      : (deps as RoomManager);

  socket.on("join-chat", async ({ chatId }) => {
    try {
      const userId = socket.userId;
      const userName = socket.userName;

      if (!userId || !userName) {
        socket.emit("join_chat_error", {
          error: "User not authenticated",
        });
        return;
      }
      logger.info(
        `Join chat request from ${userId} (${userName}) for chat ${chatId}`,
      );

      const currentChatroomId = roomManager.getChatroomIdForSocket(socket.id);
      if (currentChatroomId) {
        socket.leave(currentChatroomId);
        roomManager.cleanupUserFromRoom(socket.id, currentChatroomId);
      }

      socket.join(chatId);

      if (!roomManager.hasChatRoom(chatId)) {
        roomManager.setChatRoom(chatId, roomManager.createChatRoom(chatId));
      }

      const room = roomManager.getChatRoom(chatId)!;
      room.activeConnections++;

      let avatarUrl = socket.userImage || null;
      if (!avatarUrl) {
        try {
          const [userRecord] = await db
            .select({ image: user.image })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

          avatarUrl = userRecord?.image ?? null;
        } catch (error) {
          logger.warn("Failed to load user avatar for presence", {
            userId,
            error,
          });
        }
      }

      const userPresence: UserPresence = {
        userId,
        chatId,
        userName,
        socketId: socket.id,
        joinedAt: Date.now(),
        lastActivity: Date.now(),
        avatarUrl,
      };

      room.users.set(socket.id, userPresence);
      roomManager.setChatroomForSocket(socket.id, chatId);
      roomManager.setUserSession(socket.id, {
        userId,
        userName,
        avatarUrl,
      });
      const uniqueUserCount = roomManager.getUniqueUserCount(chatId);
      socket.to(chatId).emit("new-user", { chatId });
      logger.info(
        `User ${userId} (${userName}) joined chat ${chatId}. Room now has ${uniqueUserCount} unique users (${room.activeConnections} connections).`,
      );
    } catch (error: any) {
      logger.error("Error joining chat:", error);
      socket.emit("error", {
        type: "JOIN_ERROR",
        message: "Failed to join chat",
      });
    }
  });

  // Handle chat room details shared by existing users for newly joined users
  socket.on("chat-room-details", (data) => {
    const chatId = roomManager.getChatroomIdForSocket(socket.id);
    const session = roomManager.getUserSession(socket.id);

    if (!chatId || !session) {
      logger.debug(
        `Socket ${socket.id} attempted to share room details without being in a chat room`,
      );
      return;
    }

    logger.info(
      `User ${session.userId} sharing chat room details for chat ${chatId}`,
    );

    // Broadcast the room details to all other users in the room
    socket.to(chatId).emit("chat-room-details", {
      chatId: data.chatId,
      details: data.details,
    });
  });

  socket.on("leave-chat", () => {
    const chatId = roomManager.getChatroomIdForSocket(socket.id);
    const session = roomManager.getUserSession(socket.id);

    if (chatId && session) {
      socket.leave(chatId);
      roomManager.cleanupUserFromRoom(socket.id, chatId);
      logger.info(
        `User ${session.userId} (${session.userName}) left chat ${chatId}`,
      );
    }
  });
}
