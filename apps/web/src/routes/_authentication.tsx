import SiteLogo from "@/components/SiteLogo";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authentication")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="bg-muted min-h-svh flex flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <SiteLogo />
          <Outlet />
        </div>
      </div>
    </>
  );
}
