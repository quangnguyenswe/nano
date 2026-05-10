import { Hono } from "hono";
import { Context } from "../shared/context";
import {
  getChatRoomRequests,
  getMemberStatus,
  handleMembershipRequest,
  sendChatRoomAccessRequest,
} from "../controllers/membership.controller";

const membership = new Hono<Context>()
  .get("/status/:roomId", async (c) => {
    const userId = c.get("userId");
    const { roomId } = c.req.param();

    const status = await getMemberStatus(userId, roomId);
    return c.json(status);
  })
  .get("/requests/:roomId", async (c) => {
    const userId = c.get("userId");
    const { roomId } = c.req.param();

    const requests = await getChatRoomRequests(userId, roomId);
    return c.json(requests);
  })
  .post("/request-access/:roomId", async (c) => {
    const userId = c.get("userId");
    const { roomId } = c.req.param();

    const response = await sendChatRoomAccessRequest(userId, roomId);
    return c.json(response, 201);
  })
  .put("/handle-request/:roomId", async (c) => {
    const userId = c.get("userId");
    const { roomId } = c.req.param();
    const { approve, requestId } = await c.req.json();

    const message = await handleMembershipRequest(
      userId,
      roomId,
      requestId,
      approve,
    );
    return c.json(message);
  });

export default membership;
