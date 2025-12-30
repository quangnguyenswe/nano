import { Hono } from "hono";
import { Context } from "../shared/context";
import authRouter from "./auth.route";

const apiRouter = (app: Hono<Context>) => {
  return app.basePath("/api").route("/", authRouter);
};

export default apiRouter;
