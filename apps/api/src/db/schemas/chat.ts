import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";


export const chatRoom = pgTable("chat_room", {
  id: text("id").primaryKey().notNull(),
  name: text("name"),
  type: text("type").notNull().default("group"), // 'group' or 'direct'
  visibility: text("visibility").notNull().default("private"), // 'private' or 'public'
  avatarUrl: text("avatar_url"),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isArchived: boolean("is_archived").notNull().default(false),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const roomMember = pgTable(
  "room_member",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roomId: text("room_id")
      .notNull()
      .references(() => chatRoom.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),// 'owner', 'admin', 'member'
    status: text("status").notNull().default("joined"),// 'joined', 'invited', 'requested'
    nickname: text("nickname"),
    isMuted: boolean("is_muted").notNull().default(false),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("room_member_roomId_userId_idx").on(table.roomId, table.userId),
    index("room_member_userId_idx").on(table.userId),
  ],
);

// Relations

export const chatRoomRelations = relations(chatRoom, ({ one, many }) => ({
  creator: one(user, {
    fields: [chatRoom.createdBy],
    references: [user.id],
  }),
  members: many(roomMember),
}));

export const roomMemberRelations = relations(roomMember, ({ one }) => ({
  room: one(chatRoom, {
    fields: [roomMember.roomId],
    references: [chatRoom.id],
  }),
  user: one(user, {
    fields: [roomMember.userId],
    references: [user.id],
  }),
}));
