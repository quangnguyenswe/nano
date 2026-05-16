import { memo } from "react";
import { Button } from "@/components/ui/button";
import { SidebarToggle } from "./ChatSidebar/SidebarToggle";
import { Bell } from "lucide-react";
import { cn } from "@/lib/classname";
import AddMemberButton from "./membership/AddMemberButton";
import { useMembershipRole } from "@/store/membership";
import UserPresences from "./UserPresences";

type BaseChatHeaderProps = {
  chatId: string;
};

function BaseChatHeader(props: BaseChatHeaderProps) {
  const { chatId } = props;
  const role = useMembershipRole();

  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2 border-b border-border">
      <SidebarToggle />

      {/* Right Header */}
      <div className="ml-auto flex items-center gap-2 lg:mr-4">
        <UserPresences />
        {role === "admin" || role === "owner" ? (
          <AddMemberButton chatId={chatId} />
        ) : null}
        <Button
          className={cn("h-8 px-2 md:h-fit md:px-2")}
          data-testid="sidebar-toggle-button"
          variant="outline"
        >
          <Bell size={16} />
        </Button>
      </div>
    </header>
  );
}

export const ChatHeader = memo(BaseChatHeader, (prevProps, nextProps) => {
  return prevProps.chatId === nextProps.chatId;
});
