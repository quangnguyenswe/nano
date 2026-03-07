/// <reference types="vite/types/importMeta.d.ts" />

import type { ApiRoutes } from "@nano/api";
import { hc } from "hono/client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_URL = BASE_URL.endWith("/api") ? BASE_URL : `${BASE_URL}/api`;

export const client = hc<ApiRoutes>(API_URL, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    return fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).catch((error) => {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `Failed to connect to API server at ${API_URL}. This might be due to CORS configuration issues or the server not running. Please check your environment variables and server status.`,
        );
      }
      throw error;
    });
  },
}).api;