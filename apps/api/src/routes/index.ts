import { Hono } from "hono";
import { Context } from "../shared/context";
import chatRoom from "./chat-room.route";
import membership from "./membership.route";

const apiRouter = (app: Hono<Context>) => {
  return app
    .basePath("/api")
    .route("/chat-room", chatRoom)
    .route("/membership", membership);
};

export default apiRouter;
