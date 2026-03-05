import { Hono } from "hono";
import { Context } from "../shared/context";
import chatRoom from "./chat-room.route";

const apiRouter = (app: Hono<Context>) => {
  return app.basePath("/api").route("/chat-room", chatRoom);
};

export default apiRouter;
