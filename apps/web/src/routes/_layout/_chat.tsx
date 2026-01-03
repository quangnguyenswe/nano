import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SIDEBAR_COOKIE_NAME, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import useAuth from "@/hooks/use-auth";
import { cookieStore } from "@/lib/cookies";
import { ChatSidebar } from "@/components/ChatSidebar/ChatSidebar";
import { ChatHeader } from "@/components/ChatHeader";

export const Route = createFileRoute("/_layout/_chat")({
  component: RouteComponent,
});

function RouteComponent() {
  const isCollapsed = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === "true";
  const { user } = useAuth();

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <ChatSidebar user={user} />
      <SidebarInset>
        <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
          <ChatHeader chatId={'1243'} isReadonly={false} />
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
