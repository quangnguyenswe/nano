import { CreateChatRoomDto } from "../dtos/chat-room";
import { generateChatRoomId } from "../lib/utils";
import { db } from "../db";
import { chatRoom, roomMember } from "../db/schema";

export const createChatRoom = async (userId: string, data: CreateChatRoomDto) => {
  const roomId = await generateChatRoomId();
  const [createdChatRoom] = await db
    .insert(chatRoom)
    .values({
      id: roomId,
      createdBy: userId,
      name: data.name,
      type: data.type,
      avatarUrl: data.avatarUrl,
    })
    .returning();
  // Add user as member of the room with owner role
  await db.insert(roomMember).values({
    roomId,
    userId,
    role: "owner",
  });
  return createdChatRoom;
};
