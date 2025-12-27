import { Toaster } from "@/components/ui/toaster";
import TanStackQueryDevtools from "@/tanstack/query";
import TanStackRouterDevtools from "@/tanstack/router";
import { createRootRoute, Outlet } from "@tanstack/react-router";

const RootLayout = () => (
  <>
    <div className="flex min-h-screen flex-col overflow-x-hidden overflow-y-hidden scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 bg-sidebar">
      <Outlet />
    </div>
    <Toaster />
    <TanStackQueryDevtools />
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
