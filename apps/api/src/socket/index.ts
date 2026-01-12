import type { Server as HTTPServer } from "node:http";
import { createSocketIOServer } from "./config/socket";
import { logger } from "../logger";
import { AuthenticatedSocket, authenticateSocket } from "./middleware/auth";
import { setupAllHandlers } from "./handlers";
import { RoomManager } from "./rooms/manager";

export const initializeSockets = (httpServer: HTTPServer) => {
  const io = createSocketIOServer(httpServer);

  const roomManager = new RoomManager(io);

  io.engine.on("connection_error", (err) => {
    logger.error("Socket.IO connection error:", {
      req: err.req?.url,
      code: err.code,
      message: err.message,
      context: err.context,
    });
  });

  io.use(authenticateSocket);

  logger.info("Socket.IO authentication middleware registered");

  io.engine.on("connection_error", (err) => {
    logger.error("Socket.IO connection error:", {
      req: err.req?.url,
      code: err.code,
      message: err.message,
      context: err.context,
    });
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    logger.info(`New socket connection: ${socket.id}`);

    setupAllHandlers(socket, roomManager);
  });

  io.engine.on("connection_error", (err) => {
    logger.error("❌ Engine.IO Connection error:", {
      code: err.code,
      message: err.message,
      context: err.context,
      req: err.req
        ? {
            url: err.req.url,
            method: err.req.method,
            headers: err.req.headers,
          }
        : "No request object",
    });
  });
};
