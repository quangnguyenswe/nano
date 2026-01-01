import PageProgress from "@/components/PageProgress";
import { Toaster } from "@/components/ui/toaster";
import TanStackQueryDevtools from "@/tanstack/query";
import TanStackRouterDevtools from "@/tanstack/router";
import { type QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { User } from "better-auth/types";

export interface RouterContext {
  queryClient: QueryClient;
  user: User | null | undefined;
}

const RootLayout = () => (
  <>
    <div className="flex min-h-screen flex-col overflow-x-hidden overflow-y-hidden scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 bg-sidebar">
      <Outlet />
    </div>
    <Toaster />
    <PageProgress />
    <TanStackQueryDevtools />
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
