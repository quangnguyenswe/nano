import { Hono } from "hono";
import { Context } from "../shared/context";
import {
  getChatRoomRequests,
  getMemberStatus,
  handleMembershipRequest,
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
  .put("/handle-request/:roomId", async (c) => {
    const userId = c.get("userId");
    const { roomId } = c.req.param();
    const { approve, requestId } = await c.req.json();

    await handleMembershipRequest(userId, requestId, roomId, approve);
    return c.json({ message: "Membership request handled successfully" });
  });

export default membership;
