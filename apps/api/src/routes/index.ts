import { Hono } from "hono";
import { Context } from "../shared/context";

const apiRouter = (app: Hono<Context>) => {
  return app.basePath("/api");
};

export default apiRouter;
