import SiteLogo from "@/components/SiteLogo";
import { getLatestChatRoom } from "@/data/localStorage";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authentication")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const latestChatRoom = getLatestChatRoom();
    if (context.user) {
      if (latestChatRoom) {
        throw redirect({
          to: "/chat/$chatId",
          params: { chatId: latestChatRoom },
        });
      } else {
        throw redirect({
          to: "/chat",
        });
      }
    }
  },
});

function RouteComponent() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SiteLogo />
        <Outlet />
      </div>
    </div>
  );
}
