import * as z from "zod";

export const RoomTypes = z.enum(["direct", "group"]).options;

export type RoomType = z.infer<typeof RoomTypes>;

export const memberRoles = z.enum(["owner", "admin", "member"]).options;

export type MemberRoles = z.infer<typeof memberRoles>;

export const CreateChatRoomSchema = z.object({
  name: z.string().min(3).max(50),
  type: z.enum(RoomTypes).default("group"),
  avatarUrl: z.string().optional(),
});

export type CreateChatRoomDto = z.infer<typeof CreateChatRoomSchema>;

export const ChatRoomHistoryQuerySchema = z.object({
  limit: z.string().optional(),
  startingAfter: z.string().optional(),
  endingBefore: z.string().optional(),
});
