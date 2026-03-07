import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Context } from "../shared/context";
import { CreateChatRoomSchema } from "../dtos/chat-room";
import { createChatRoom } from "../controllers/chat-room.controller";

const chatRoom = new Hono<Context>().post(
  "/create",
  zValidator("json", CreateChatRoomSchema),
  async (c) => {
    const createChatRoomDto = c.req.valid("json");
    const userId = c.get("userId");
    await createChatRoom(userId, createChatRoomDto);
    return c.json({ message: "Chat room created successfully" }, 201);
  },
);

export default chatRoom;
