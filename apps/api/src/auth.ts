import { betterAuth } from "better-auth";
import { logger } from "./logger";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import bcrypt from "bcrypt";

const API_URL = process.env.API_URL || "http://localhost:5000";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const isHttps = API_URL.startsWith("https://");
const isCrossSubdomain = (() => {
  // Determine if API and Client are on different subdomains
  try {
    const apiHost = new URL(API_URL).hostname;
    const clientHost = new URL(CLIENT_URL).hostname;
    return (
      apiHost !== clientHost &&
      apiHost !== "localhost" &&
      clientHost !== "localhost"
    );
  } catch {
    return false;
  }
})();

if (!process.env.BETTER_AUTH_SECRET) {
  logger.error("BETTER_AUTH_SECRET is not set in environment variables.");
  process.exit(1);
}

const baseURLWithoutPath = (() => {
  try {
    const url = new URL(API_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    return API_URL.split("/").slice(0, 3).join("/"); // Get protocol://host
  }
})();
const trustedOrigins = [CLIENT_URL];

try {
  const apiOrigin = new URL(API_URL);
  const apiOriginString = `${apiOrigin.protocol}//${apiOrigin.host}`;
  if (!trustedOrigins.includes(apiOriginString)) {
    trustedOrigins.push(apiOriginString);
  }
} catch {}


export const auth = betterAuth({
  baseURL: baseURLWithoutPath,
  secret: process.env.BETTER_AUTH_SECRET || "",
  trustedOrigins,
  basePath: "/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    password: {
      hash: async (password: string) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({
        hash,
        password,
      }: {
        hash: string;
        password: string;
      }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      // For cross-subdomain auth with HTTPS, use sameSite: "none" with secure: true
      // For same-domain or HTTP deployments, use sameSite: "lax" with secure: false
      sameSite: isCrossSubdomain && isHttps ? "none" : "lax",
      secure: isCrossSubdomain && isHttps, // must be true when sameSite is "none"
      partitioned: isCrossSubdomain && isHttps,
      domain: process.env.COOKIE_DOMAIN || undefined, // Optional: e.g., ".andrej.com" for explicit cross-subdomain cookies
    },
  },
});
