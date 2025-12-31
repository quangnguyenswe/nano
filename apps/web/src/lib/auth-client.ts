import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  try {
    const url = new URL(API_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    return API_URL.split("/").slice(0, 3).join("/");
  }
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  basePath: "/api/auth",
})