import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Context } from "../shared/context";
import {
  ChatRoomHistoryQuerySchema,
  CreateChatRoomSchema,
} from "../dtos/chat-room";
import {
  createChatRoom,
  getUserChatRooms,
} from "../controllers/chat-room.controller";

const chatRoom = new Hono<Context>()
  .post("/create", zValidator("json", CreateChatRoomSchema), async (c) => {
    const createChatRoomDto = c.req.valid("json");
    const userId = c.get("userId");

    const chatRoom = await createChatRoom(userId, createChatRoomDto);
    return c.json(chatRoom, 201);
  })
  .get(
    "/history",
    zValidator("query", ChatRoomHistoryQuerySchema),
    async (c) => {
      const userId = c.get("userId");
      const { limit, startingAfter, endingBefore } = c.req.valid("query");

      const validLimit = Math.min(
        Math.max(Number.parseInt(limit || "10") || 10, 1), // Ensure limit is at least 1,
        50, // Set an upper bound to prevent excessive data fetching
      );

      if (!userId) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      if (startingAfter && endingBefore) {
        return c.json(
          {
            message:
              "Only one of startingAfter or endingBefore can be provided.",
          },
          400,
        );
      }

      const chats = await getUserChatRooms(userId, {
        limit: validLimit,
        startingAfter: typeof startingAfter === "string" ? startingAfter : null,
        endingBefore: typeof endingBefore === "string" ? endingBefore : null,
      });

      return c.json(chats);
    },
  );
export default chatRoom;
