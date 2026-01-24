import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import {
  SIDEBAR_COOKIE_NAME,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/use-auth";
import { cookieStore } from "@/lib/cookies";
import { ChatSidebar } from "@/components/ChatSidebar/ChatSidebar";
import { ChatHeader } from "@/components/ChatHeader";
import { SocketProvider } from "@/providers/socket";

export const Route = createFileRoute("/_layout/_chat")({
  component: RouteComponent,
});

function RouteComponent() {
  const isCollapsed = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === "false";
  const { user } = useAuth();

  const { chatId } = useParams({ strict: false })

  return (
    <SocketProvider user={user!} chatId={chatId}>
      <SidebarProvider defaultOpen={!isCollapsed}>
        <ChatSidebar user={user} />
        <SidebarInset>
          <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
            <ChatHeader chatId={chatId!} isReadonly={false} />
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SocketProvider>
  );
}
