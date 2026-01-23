import { memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { ChatRoomMetadata } from "@/types/message";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal, Share, Trash } from "lucide-react";
import { cn } from "@/lib/classname";

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: ChatRoomMetadata;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  // const { visibilityType, setVisibilityType } = useChatVisibility({
  //   chatId: chat.id,
  //   initialVisibilityType: chat.visibility,
  // });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link
          to="/chat/$chatId"
          params={{ chatId: chat.id }}
          onClick={() => setOpenMobile(false)}
        >
          <span>{chat.name}</span>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
              // Increases the hit area of the button on mobile.
              "after:absolute after:-inset-2 md:after:hidden",
              "peer-data-[size=sm]/menu-button:top-1",
              "peer-data-[size=default]/menu-button:top-1.5",
              "peer-data-[size=lg]/menu-button:top-2.5",
              "group-data-[collapsible=icon]:hidden",
              "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
              "mr-0.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover cursor-pointer",
            )}
          >
            <MoreHorizontal />
            <span className="sr-only">More</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" side="bottom">
          <DropdownMenuItem className="cursor-pointer">
            <Share />
            <span>Share</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
            onSelect={() => onDelete(chat.id)}
          >
            <Trash />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) {
    return false;
  }
  return true;
});

//https://excalidraw.com/#room=83325dd1885048312b85,i79qCXYL8xSZid6GT-v8kw
