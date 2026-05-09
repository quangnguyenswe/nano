import { CreateChatRoomDto } from "../dtos/chat-room";
import { generateChatRoomId } from "../lib/utils";
import { db } from "../db";
import { chatRoom, roomMember, user } from "../db/schema";
import { eq, SQL, desc, and, gt, count, or } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { logger } from "../logger";

export const getMemberStatus = async (userId: string, roomId: string) => {
  const [membership] = await db
    .select({
      status: roomMember.status,
      role: roomMember.role,
    })
    .from(roomMember)
    .where(and(eq(roomMember.roomId, roomId), eq(roomMember.userId, userId)))
    .limit(1);

  if (!membership) {
    return {
      status: "none",
      role: "guest",
    };
  }

  return membership;
};

export const getChatRoomRequests = async (userId: string, roomId: string) => {
  //Check if the user is the owner or admin of the room
  const [admin] = await db
    .select({
      status: roomMember.status,
      role: roomMember.role,
    })
    .from(roomMember)
    .where(
      and(
        eq(roomMember.roomId, roomId),
        eq(roomMember.userId, userId),
        or(eq(roomMember.role, "owner"), eq(roomMember.role, "admin")),
      ),
    )
    .limit(1);

  if (!admin) {
    throw new HTTPException(403, {
      message: "You do not have permission to view membership requests",
    });
  }

  const requests = await db
    .select({
      id: roomMember.id,
      name: user.name,
      email: user.email,
      avatar: user.image,
    })
    .from(roomMember)
    .innerJoin(user, eq(roomMember.userId, user.id))
    .where(
      and(eq(roomMember.roomId, roomId), eq(roomMember.status, "requested")),
    );

  return requests;
};

export const handleMembershipRequest = async (
  userId: string,
  roomId: string,
  requestId: string,
  approve: boolean,
) => {
  //Check if the user is the owner or admin of the room
  const [admin] = await db
    .select({
      status: roomMember.status,
      role: roomMember.role,
    })
    .from(roomMember)
    .where(
      and(
        eq(roomMember.roomId, roomId),
        eq(roomMember.userId, userId),
        or(eq(roomMember.role, "owner"), eq(roomMember.role, "admin")),
      ),
    )
    .limit(1);

  if (!admin) {
    throw new HTTPException(403, {
      message: "You do not have permission to approve membership requests",
    });
  }

  const [request] = await db
    .select({
      id: roomMember.id,
      status: roomMember.status,
    })
    .from(roomMember)
    .where(eq(roomMember.id, requestId))
    .limit(1);

  if (!request) {
    throw new HTTPException(404, {
      message: "Membership request not found",
    });
  }

  await db
    .update(roomMember)
    .set({
      status: approve ? "joined" : "rejected",
    })
    .where(eq(roomMember.id, request.id));

  return {
    message: `Membership request has been ${approve ? "approved" : "rejected"}`,
  };
};
