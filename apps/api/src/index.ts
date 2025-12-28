import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";
import apiRouter from "./routes";
import "dotenv/config";
const isProd = process.env.NODE_ENV === "production";
const app = new Hono();
const corsOrigins = process.env.CORS_ORIGINS?.split(",");
app.use(
  "*",
  cors({
    credentials: true,
    origin: (origin) => {
      if (!corsOrigins) {
        return origin || "*";
      }

      if (!origin) {
        return null;
      }

      return corsOrigins.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(logger());

app.get("/ping", (c) => {
  return c.json({ message: "pong" });
});

const routes = apiRouter(app);

//Error handling middleware
app.onError((err, c) => {
  console.error(`${err}`);
  if (err instanceof HTTPException) {
    const errResponse =
      err.res ??
      c.json(
        {
          message: err.message,
          statusCode: err.status,
          error: err.message,
        },
        err.status,
      );
    return errResponse;
  }

  return c.json(
    {
      statusCode: 500,
      message: isProd ? "Internal Server Error" : err.message,
    },
    500,
  );
});

async function startServer() {
  serve(
    {
      fetch: app.fetch,
      port: Number(process.env.PORT),
    },
    (info) => {
      console.log(`🚀 Server is running on http://localhost:${info.port}`);
    },
  );
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

export type ApiRoutes = typeof routes;
