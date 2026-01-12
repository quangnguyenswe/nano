import { memo } from "react";
import { Button } from "@/components/ui/button";

import { useSidebar } from "./ui/sidebar";
import { SidebarToggle } from "./ChatSidebar/SidebarToggle";
import { PlusIcon } from "lucide-react";
import { isMobileScreen } from "@/lib/mobile";
import { authClient } from "@/lib/auth-client";

type BaseChatHeaderProps = {
  chatId: string;
  isReadonly: boolean;
};

function BaseChatHeader(props: BaseChatHeaderProps) {
  const { open } = useSidebar();
  const isMobile = isMobileScreen();


  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2 border-b border-border">
      <SidebarToggle />

      {(!open || isMobile) && (
        <Button
          className="order-2 ml-auto h-8 px-2 md:order-1 md:ml-0 md:h-fit md:px-2"
          onClick={() => {
            //TODO: implement new chat functionality
          }}
          variant="outline"
        >
          <PlusIcon />
          <span className="md:sr-only">New Chat</span>
        </Button>
      )}

      {/* Right Header */}
      <Button
        asChild
        className="order-3 hidden bg-zinc-900 px-2 text-zinc-50 hover:bg-zinc-800 md:ml-auto md:flex md:h-fit dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Beta
      </Button>
    </header>
  );
}

export const ChatHeader = memo(BaseChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
