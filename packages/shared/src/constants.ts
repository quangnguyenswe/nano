export const ENCRYPTION_KEY_BITS = 128;
export const IV_LENGTH_BYTES = 12; // 96 bits for AES-GCM
export const CHAT_ROOM_ID_BYTES = 16; // 128 bits for UUIDv4

export enum WS_EVENTS {
  // SOCKET EVENTS
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  RECONNECT = "reconnect",

  SEND_MESSAGE = "send-message",
  NEW_MESSAGE = "new-message",

  // Chat room events
  JOIN_CHAT = "join-chat",
  LEAVE_CHAT = "leave-chat",
  
}
