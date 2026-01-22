import z from "zod";

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
}

const ChatRoomMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  lastUpdated: z.number(),
  unreadCount: z.number().optional(),
})

export type ChatRoomMetadata = z.infer<typeof ChatRoomMetadataSchema>;

const ChatMessageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  content: z.string(),
  type: z.enum(MessageType),
  fileId: z.string().optional(),
  timestamp: z.number(),
  status: z.enum(MessageStatus),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const LocalStorageChatRoomSchema = z.record(
  z.string(),
  ChatRoomMetadataSchema.omit({ id: true }),
)

export type LocalStorageChatRooms = z.infer<typeof LocalStorageChatRoomSchema>;

export type DataURL = string & { _brand: "DataURL" };

const BinaryFileDataSchema = z.object({
  id: z.string(),
  mimeType: z.string(),
  dataURL: z.string(),
  createdAt: z.number(),
  lastRetrieved: z.number(),
  version: z.number(),
})

export type BinaryFileData = z.infer<typeof BinaryFileDataSchema>;

export type BinaryFileMetadata = Omit<BinaryFileData, "dataURL">;

export type BinaryFiles = Record<string, BinaryFileData>;