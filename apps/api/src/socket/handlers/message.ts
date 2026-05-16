import { logger } from "../../logger";
import type { AuthenticatedSocket } from "../middleware/auth";
import type { RoomManager } from "../rooms/manager";
import type { HandlerDependencies } from "./chat";

// TODO: There is a small bug when user send an image and other users receive 2 images
export function setupMessageHandlers(
  socket: AuthenticatedSocket,
  deps: HandlerDependencies | RoomManager,
) {
  const roomManager =
    deps instanceof Object && "roomManager" in deps
      ? deps.roomManager
      : (deps as RoomManager);

  socket.on("send-message", async (data) => {
    const chatId = roomManager.getChatroomIdForSocket(socket.id);
    const session = roomManager.getUserSession(socket.id);

    if (!chatId || !session) {
      logger.debug(
        `Socket ${socket.id} attempted to send message without being in a chat room`,
      );
      return;
    }

    const { messageId, content, timestamp, attachment } = data;
    const room = roomManager.getChatRoom(chatId);
    logger.info(
      `Socket ${socket.id} sending message to chat ${chatId}: ${content}`,
    );
    if (!room) {
      logger.debug(`Chat room ${chatId} not found for socket ${socket.id}`);
      return;
    }

    try {
      const userPresence = room.users.get(socket.id);
      if (userPresence) {
        userPresence.lastActivity = Date.now();
      }

      // Broadcast the message to other users in the chat room
      logger.info(
        `Broadcasting message from socket ${socket.id} to chat ${chatId}`,
      );
      socket.to(chatId).emit("new-message", {
        messageId,
        chatId,
        userId: session.userId,
        userName: session.userName,
        content,
        timestamp,
        attachment,
      });
    } catch (error: any) {
      logger.error(
        `Error handling send-message for socket ${socket.id} in chat ${chatId}:`,
        error,
      );

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
    }
  });
}
