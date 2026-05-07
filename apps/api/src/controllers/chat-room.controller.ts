import { CreateChatRoomDto } from "../dtos/chat-room";
import { generateChatRoomId } from "../lib/utils";
import { db } from "../db";
import { chatRoom, roomMember } from "../db/schema";
import { eq, SQL, desc, and, gt, count } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { logger } from "../logger";

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
            ? and(whereCondition, eq(roomMember.userId, userId), eq(roomMember.status, "joined"))
            : and(eq(roomMember.userId, userId), eq(roomMember.status, "joined"))
          ,
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

export const deleteChatRoom = async (userId: string, roomId: string) => {
  // Check if the user is the owner of the chat room
  const [membership] = await db
    .select()
    .from(roomMember)
    .where(
      and(
        eq(roomMember.roomId, roomId),
        eq(roomMember.userId, userId),
        eq(roomMember.role, "owner"),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new HTTPException(403, {
      message: "You do not have permission to delete this chat room",
    });
  }

  // Delete the chat room and its memberships
  // Note: Since we use cascading deletes in the database, deleting the chat room will automatically delete related memberships and messages
  await db.delete(chatRoom).where(eq(chatRoom.id, roomId));

  return { message: "Chat room deleted successfully" };
};

export const leaveChatRoom = async (userId: string, roomId: string) => {
  // Check if the user is a member of the chat room or not
  const [membership] = await db
    .select()
    .from(roomMember)
    .where(and(eq(roomMember.roomId, roomId), eq(roomMember.userId, userId)))
    .limit(1);

  if (!membership) {
    throw new HTTPException(403, {
      message: "You are not a member of this chat room",
    });
  }

  // If user is the only owner, prevent leaving the room without deleting it
  if (membership.role === "owner") {
    const ownerCount = await db
      .select({ count: count() })
      .from(roomMember)
      .where(and(eq(roomMember.roomId, roomId), eq(roomMember.role, "owner")));

    if (ownerCount[0].count <= 1) {
      throw new HTTPException(403, {
        message:
          "You cannot leave the chat room as you are the only owner. Please delete the room or assign another owner before leaving.",
      });
    }
  }

  // Remove the user from the chat room
  await db
    .delete(roomMember)
    .where(and(eq(roomMember.roomId, roomId), eq(roomMember.userId, userId)));

  return { message: "You have left the chat room successfully" };
};

export const getMemberStatus = async (userId: string, roomId: string) => {
  const [membership] = await db
    .select({
      status: roomMember.status,
    })
    .from(roomMember)
    .where(and(eq(roomMember.roomId, roomId), eq(roomMember.userId, userId)))
    .limit(1);

  if (!membership) {
    return {
      status: "guest",
    };
  }

  return membership.status;
};

export const sendChatRoomAccessRequest = async (
  userId: string,
  roomId: string,
) => {
  // Check if the user has already sent a request or is already a member
  const [existingMembership] = await db
    .select({
      status: roomMember.status,
    })
    .from(roomMember)
    .where(and(eq(roomMember.roomId, roomId), eq(roomMember.userId, userId)))
    .limit(1);

  if (existingMembership && existingMembership.status === "requested") {
    throw new HTTPException(400, {
      message:
        "You have already requested access to this chat room. Please wait for approval.",
    });
  }

  if (existingMembership && existingMembership.status === "joined") {
    throw new HTTPException(400, {
      message: "You are already a member of this chat room.",
    });
  }

  if (existingMembership && existingMembership.status === "invited") {
    throw new HTTPException(400, {
      message: "You have already been invited to this chat room. Please check your invitations.",
    });
  }

  // Create a new membership request
  await db.insert(roomMember).values({
    roomId,
    userId,
    role: "member",
    status: "requested",
  });

  return { message: "Access request sent successfully" };
};
