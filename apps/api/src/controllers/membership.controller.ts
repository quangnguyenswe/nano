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
      message:
        "You have already been invited to this chat room. Please check your invitations.",
    });
  }

  // Create a new membership request
  await db.insert(roomMember).values({
    roomId,
    userId,
    role: "member",
    status: "requested",
  });

  // TODO: Notify the room admins/owners about the new membership request

  return { message: "Access request sent successfully" };
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
  console.log(userId, roomId, requestId, approve);
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

  console.log(admin);
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

  if (approve && request.status === "requested") {
    await db
      .update(roomMember)
      .set({
        status: "joined",
      })
      .where(eq(roomMember.id, request.id));
  } else {
    await db.delete(roomMember).where(eq(roomMember.id, request.id));
    // TODO: Notify the user that their request has been rejected
  }

  return {
    message: `Membership request has been ${approve ? "approved" : "rejected"}`,
  };
};
