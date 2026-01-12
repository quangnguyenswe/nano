import { logger } from "../../logger";
import type { AuthenticatedSocket } from "../middleware/auth";
import type { RoomManager } from "../rooms/manager";
import type { HandlerDependencies } from "./chat";

export function setupConnectionHandlers(
  socket: AuthenticatedSocket,
  deps: HandlerDependencies | RoomManager,
) {
  const roomManager =
    deps instanceof Object && "roomManager" in deps
      ? deps.roomManager
      : (deps as RoomManager);

  socket.on("error", (error) => {
    logger.error(`Socket ${socket.id} error:`, error);
  });
  socket.conn.on("error", (error) => {
    logger.error(`Socket ${socket.id} connection error:`, error);
  });

  socket.on("disconnect", (reason) => {
    const chatroomId = roomManager.getChatroomIdForSocket(socket.id);
    const session = roomManager.getUserSession(socket.id);

    if (chatroomId && session) {
      roomManager.cleanupUserFromRoom(socket.id, chatroomId);
    }
  });
}
