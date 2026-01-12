import type { AuthenticatedSocket } from "../middleware/auth";
import type { RoomManager } from "../rooms/manager";
import { setupChatHandlers } from "./chat";
import { setupConnectionHandlers } from "./connection";
import { setupMessageHandlers } from "./message";

export function setupAllHandlers(
  socket: AuthenticatedSocket,
  roomManager: RoomManager,
) {
  setupChatHandlers(socket, roomManager);
  setupMessageHandlers(socket, roomManager);
  setupConnectionHandlers(socket, roomManager);
}

export { setupConnectionHandlers };
