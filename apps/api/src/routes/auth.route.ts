import { Hono } from "hono";
import { Context } from "../shared/context";
import { auth } from "../auth";

const authRouter = new Hono<Context>();

authRouter.on(["POST", "GET", "PUT", "DELETE"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

export default authRouter;