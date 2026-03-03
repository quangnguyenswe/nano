

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
