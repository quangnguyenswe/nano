import { Hono } from "hono";

const apiRouter = (app: Hono) => {
  return app.basePath("/");
};

export default apiRouter;
