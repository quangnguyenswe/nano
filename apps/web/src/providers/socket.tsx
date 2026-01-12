import { authClient } from "@/lib/auth-client";
import { createLogger } from "@/lib/logger";
import { useParams } from "@tanstack/react-router";
import { User } from "better-auth/types";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";

const logger = createLogger("SocketProvider");

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  currentChatflowId: string | null;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  emitMessage: (chatId: string, content: string, messageId: string) => void;

  onMessageUpdate: (handler: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isConnecting: false,
  currentChatflowId: null,
  joinChat: () => {},
  leaveChat: () => {},
  emitMessage: () => {},

  onMessageUpdate: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
  user?: User;
}

export function SocketProvider({ children, user }: SocketProviderProps) {
  const { chatId: urlChatflowId } = useParams({
    from: "/_layout/_chat/chat/$chatId",
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentChatflowId, setCurrentChatflowId] = useState<string | null>(
    null,
  );
  const initializedRef = useRef(false);

  const eventHandlers = useRef<{
    messageUpdate?: (data: any) => void;
  }>({});

  const generateSocketToken = useCallback(async (): Promise<string> => {
    const { data, error } = await authClient.oneTimeToken.generate();

    if (error || !data?.token) {
      throw new Error("Failed to generate socket token");
    }
    return data.token;
  }, []);

  const initializeSocket = () => {
    try {
      const socketUrl =
        import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

      logger.info("Attempting to connect to Socket.IO server", {
        url: socketUrl,
        userId: user?.id || "no-user",
        timestamp: new Date().toISOString(),
      });

      const socketInstance = io(socketUrl, {
        transports: ["websocket", "polling"], // Keep polling fallback for reliability
        withCredentials: true,
        reconnectionAttempts: Number.POSITIVE_INFINITY, // Socket.IO handles base reconnection
        reconnectionDelay: 1000, // Start with 1 second delay
        reconnectionDelayMax: 30000, // Max 30 second delay
        timeout: 10000, // Back to original timeout
        auth: async (cb) => {
          try {
            const freshToken = await generateSocketToken();
            cb({ token: freshToken });
          } catch (error) {
            logger.error(
              "Failed to generate fresh token for connection:",
              error,
            );
            cb({ token: null });
          }
        },
      });

      // Connection events
      socketInstance.on("connect", () => {
        setIsConnected(true);
        setIsConnecting(false);
        logger.info("Socket connected successfully", {
          socketId: socketInstance.id,
          connected: socketInstance.connected,
          transport: socketInstance.io.engine?.transport?.name,
        });

        // Automatically join the current chat room based on URL
        // This handles both initial connections and reconnections
        if (urlChatflowId) {
          logger.info(`Joining chat room after connection: ${urlChatflowId}`);
          socketInstance.emit("join-chat", {
            chatId: urlChatflowId,
          });
          // Update our internal state to match the URL
          setCurrentChatflowId(urlChatflowId);
        }
      });

      socketInstance.on("disconnect", (reason) => {
        setIsConnected(false);
        setIsConnecting(false);

        logger.info("Socket disconnected", {
          reason,
        });

        // Clear presence when disconnected
      });

      socketInstance.on("connect_error", (error: any) => {
        setIsConnecting(false);
        logger.error("Socket connection error:", {
          message: error.message,
          stack: error.stack,
          description: error.description,
          type: error.type,
          transport: error.transport,
        });

        // Authentication errors now indicate either session expiry or token generation issues
        if (
          error.message?.includes("Token validation failed") ||
          error.message?.includes("Authentication failed") ||
          error.message?.includes("Authentication required")
        ) {
          logger.warn(
            "Authentication failed - this could indicate session expiry or token generation issues",
          );
          // The fresh token generation on each attempt should handle most cases automatically
          // If this persists, user may need to refresh page or re-login
        }
      });

      // Socket.IO provides reconnection logging with attempt numbers
      socketInstance.on("reconnect", (attemptNumber) => {
        logger.info("Socket reconnected successfully", {
          attemptNumber,
          socketId: socketInstance.id,
          transport: socketInstance.io.engine?.transport?.name,
        });
        // Note: Workflow rejoining is handled by the 'connect' event which fires for both initial connections and reconnections
      });

      socketInstance.on("reconnect_attempt", (attemptNumber) => {
        logger.info(
          "Socket reconnection attempt (fresh token will be generated)",
          {
            attemptNumber,
            timestamp: new Date().toISOString(),
          },
        );
      });

      socketInstance.on("reconnect_error", (error: any) => {
        logger.error("Socket reconnection error:", {
          message: error.message,
          attemptNumber: error.attemptNumber,
          type: error.type,
        });
      });

      socketInstance.on("reconnect_failed", () => {
        logger.error("Socket reconnection failed - all attempts exhausted");
        setIsConnecting(false);
      });

      // Enhanced error handling for new server events
      socketInstance.on("error", (error) => {
        logger.error("Socket error:", error);
      });

      socketInstance.on("new-message", (data) => {
        eventHandlers.current.messageUpdate?.(data);
      });
      setSocket(socketInstance);

      return () => {
        socketInstance.close();
      };
    } catch (error) {
      logger.error("Failed to initialize socket with token:", error);
      setIsConnecting(false);
      return;
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    // Only initialize if we don't have a socket and aren't already connecting
    if (initializedRef.current || socket || isConnecting) {
      logger.info(
        "Socket already exists or is connecting, skipping initialization",
      );
      return;
    }

    logger.info("Initializing socket connection for user:", user.id);
    initializedRef.current = true;
    setIsConnecting(true);

    // Start the socket initialization
    initializeSocket();

    // Cleanup on unmount only (not on user change since socket is session-level)
    return () => {
      logger.info("Cleaning up socket connection on unmount");
    };
  }, [user?.id]);

  useEffect(() => {
    if (!socket || !isConnected || !urlChatflowId) return;

    // If we're already in the correct workflow room, no need to switch
    if (currentChatflowId === urlChatflowId) return;

    logger.info(
      `URL workflow changed from ${currentChatflowId} to ${urlChatflowId}, switching rooms`,
    );

    // Leave current workflow first if we're in one
    if (currentChatflowId) {
      logger.info(
        `Leaving current workflow ${currentChatflowId} before joining ${urlChatflowId}`,
      );
      socket.emit("leave-chat");
    }

    // Join the new workflow room
    logger.info(`Joining workflow room: ${urlChatflowId}`);
    socket.emit("join-chat", {
      chatflowId: urlChatflowId,
    });
    setCurrentChatflowId(urlChatflowId);
  }, [socket, isConnected, urlChatflowId, currentChatflowId]);

  // Cleanup socket on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        logger.info("Cleaning up socket connection on unmount");
        socket.disconnect();
      }
    };
  }, []);

  const joinChat = useCallback(
    (chatId: string) => {
      if (!socket || !user?.id) {
        logger.warn("Cannot join chat: socket or user not available");
        return;
      }

      // Prevent duplicate joins to the same chat
      if (currentChatflowId === chatId) {
        logger.info(`Already in chat ${chatId}, skipping join`);
        return;
      }

      // Leave current chat first if we're in one
      if (currentChatflowId) {
        logger.info(
          `Leaving current chat ${currentChatflowId} before joining ${chatId}`,
        );
        socket.emit("leave-chat");
      }

      logger.info(`Joining chat: ${chatId}`);
      socket.emit("join-chat", {
        chatId: chatId, // Server gets user info from authenticated session
      });
      setCurrentChatflowId(chatId);
    },
    [socket, user, currentChatflowId],
  );

  // Leave current chat room
  const leaveChat = useCallback(() => {
    if (socket && currentChatflowId) {
      logger.info(`Leaving chat: ${currentChatflowId}`);
      try {
        // const { useOperationQueueStore } = import('@/stores/operation-queue/store')
        // useOperationQueueStore.getState().cancelOperationsForWorkflow(currentChatflowId)
      } catch {}
      socket.emit("leave-chat");
      setCurrentChatflowId(null);
    }
  }, [socket, currentChatflowId]);

  const emitMessage = useCallback(
    (chatId: string, content: string, messageId: string) => {
      if (socket && currentChatflowId) {
        socket.emit("send-message", {
          messageId,
          content,
          timestamp: Date.now(),
        });
      } else {
        logger.warn(
          "Cannot emit subblock update: no socket connection or workflow room",
          {
            hasSocket: !!socket,
            currentChatflowId,
            messageId,
            chatId,
          },
        );
      }
    },
    [socket, currentChatflowId],
  );

  const onMessageUpdate = useCallback((handler: (data: any) => void) => {
    eventHandlers.current.messageUpdate = handler;
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        isConnecting,
        currentChatflowId,
        joinChat: joinChat,
        leaveChat: leaveChat,
        emitMessage: emitMessage,

        onMessageUpdate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
