import { z } from "zod";

const ChatRoom = z.object({
  id: z.string(),
  name: z.string().max(100),
  type: z.enum(["private", "group"]),
  avatarUrl: z.string().url().optional(),
  lastMessageAt: z.date(),
});

export type ChatRoom = z.infer<typeof ChatRoom>;

export const ChatHistorySchema = z.object({
  chats: z.array(ChatRoom),
  hasMore: z.boolean(),
});

export type ChatHistory = z.infer<typeof ChatHistorySchema>;
