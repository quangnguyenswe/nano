import { CreateChatRoomDto } from "../dtos/chat-room";
import { generateChatRoomId } from "../lib/utils";
import { db } from "../db";
import { chatRoom, roomMember } from "../db/schema";
import { eq, SQL, desc, and, gt } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { logger } from "../logger";
import { id } from "zod/v4/locales";

export const createChatRoom = async (
  userId: string,
  data: CreateChatRoomDto,
) => {
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

export const getUserChatRooms = async (
  userId: string,
  opts?: {
    limit: number;
    startingAfter: string | null;
    endingBefore: string | null;
  },
) => {
  const { limit = 20, startingAfter, endingBefore } = opts || {};

  // Get all room memberships for the user
  try {
    const extendedLimit = limit + 1; // Fetch one extra to determine if there's a next page

    const query = (whereCondition?: SQL<unknown>) =>
      db
        .select({
          id: chatRoom.id,
          name: chatRoom.name,
          type: chatRoom.type,
          avatarUrl: chatRoom.avatarUrl,
          lastMessageAt: chatRoom.lastMessageAt,
        })
        .from(chatRoom)
        .innerJoin(roomMember, eq(chatRoom.id, roomMember.roomId))
        .where(
          whereCondition
            ? and(whereCondition, eq(roomMember.userId, userId))
            : eq(roomMember.userId, userId),
        )
        .orderBy(desc(chatRoom.lastMessageAt))
        .limit(extendedLimit);

    let filteredChatRooms = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chatRoom)
        .where(eq(chatRoom.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        logger.error(`Chat with id ${startingAfter} not found for pagination`);
        throw new HTTPException(400, {
          message: `Chat with id ${startingAfter} not found for pagination`,
        });
      }
      filteredChatRooms = await query(
        gt(chatRoom.lastMessageAt, selectedChat.lastMessageAt),
      );
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chatRoom)
        .where(eq(chatRoom.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        logger.error(`Chat with id ${endingBefore} not found for pagination`);
        throw new HTTPException(400, {
          message: `Chat with id ${endingBefore} not found for pagination`,
        });
      }
      filteredChatRooms = await query(
        gt(chatRoom.createdAt, selectedChat.createdAt),
      );
    } else {
      filteredChatRooms = await query();
    }
    const hasMore = filteredChatRooms.length > limit;

    return {
      chats: hasMore ? filteredChatRooms.slice(0, limit) : filteredChatRooms,
      hasMore,
    };
  } catch (error) {
    logger.error("Failed to fetch chat rooms", { cause: error });

    throw new HTTPException(500, {
      message: "Failed to fetch chat rooms",
      cause: error,
    });
  }
};
