import { drizzle } from "drizzle-orm/node-postgres";
// import * as schema from "./schema";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 50,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 10000,
});

export const db = drizzle(pool, {
  // schema,
});
