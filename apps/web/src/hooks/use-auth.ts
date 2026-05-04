import { authClient } from "@/lib/auth-client";
import { getErrorStatus } from "@/lib/errors";
import { AuthContext } from "@/providers/auth";
import { QueryClient, queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { Session, User } from "better-auth/types";
import { useContext } from "react";

export interface SessionData {
  user: User;
  session: Session;
}

export const sessionQueryKey = ["auth", "session"] as const;

// Returns null when unauthenticated (not an error condition).
// Only overrides staleTime and retry — inherits gcTime, refetchOnWindowFocus,
// refetchOnReconnect, and retryDelay from QueryClient defaults.
export function sessionQueryOptions() {
  return queryOptions<SessionData | null>({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const response = await authClient.getSession();
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    // Shorter freshness than global 2min — auth state should stay current
    staleTime: 30_000,
    // Don't retry 401/403 — retrying won't help for auth/permission errors
    retry(failureCount, error) {
      const status = getErrorStatus(error);
      if (status === 401 || status === 403) return false;
      return failureCount < 3;
    },
  });
}

export function useSessionQuery() {
  return useQuery(sessionQueryOptions());
}

export function useSuspenseSessionQuery() {
  return useSuspenseQuery(sessionQueryOptions());
}

export function getCachedSession(
  queryClient: QueryClient,
): SessionData | null | undefined {
  return queryClient.getQueryData(sessionQueryKey);
}

export function isAuthenticated(queryClient: QueryClient): boolean {
  const session = getCachedSession(queryClient);
  return session?.user != null && session?.session != null;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
