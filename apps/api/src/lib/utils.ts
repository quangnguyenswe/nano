import { generateEncryptionKey, generateRoomId } from "@nano/shared";

export const generateChatRoomId = async (): Promise<string> => {
  const roomId = await generateRoomId();
  const roomKey = await generateEncryptionKey();
  // const roomId = "sample-room-id";
  // const roomKey = "sample-room-key";

  if (!roomKey) {
    throw new Error("Couldn't generate room key");
  }

  return `${roomId}:${roomKey}`;
};
