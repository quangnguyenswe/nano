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
import { LogOut, MoreHorizontal, Share, Trash } from "lucide-react";
import { cn } from "@/lib/classname";
import { ChatHistory, ChatRoom } from "@/types/chat-room";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  onLeave,
  setOpenMobile,
}: {
  chat: ChatRoom;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  onLeave: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  // const { visibilityType, setVisibilityType } = useChatVisibility({
  //   chatId: chat.id,
  //   initialVisibilityType: chat.visibility,
  // });

  return (
    <div className="group/item relative">
      <Link
        to="/chat/$chatId"
        params={{ chatId: chat.id }}
        onClick={() => setOpenMobile(false)}
      >
        <div
          className={cn(
            "hover:bg-muted/30 relative flex min-w-0 cursor-pointer items-center gap-4 py-3 px-1.5 rounded-md",
            isActive && "bg-muted!",
          )}
        >
          <Avatar className="size-10 border border-border">
            {/* <AvatarImage src={image} alt={chat.name} className="object-contain" /> */}
            <AvatarFallback>{chat.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 grow flex flex-col gap-2">
            <div className="flex items-center justify-between pr-2">
              <span className="truncate text-sm font-medium">{chat.name}</span>
              <span className="text-muted-foreground flex-none text-xs">
                10m ago
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground truncate text-start text-xs">
                This is a placeholder for the last message preview.
              </span>
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute end-0 top-0 bottom-0 flex items-center bg-linear-to-l from-50% px-4 opacity-0 group-hover/item:opacity-100 from-muted/50 rounded-r-lg">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size={"icon"}
              variant={"outline"}
              className=" size-8 [&_svg:not([class*='size-'])]:size-3 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <MoreHorizontal />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="center" side="bottom">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => onLeave(chat.id)}
            >
              <LogOut />
              <span>Leave</span>
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
      </div>
    </div>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (
    prevProps.isActive !== nextProps.isActive ||
    prevProps.chat.id !== nextProps.chat.id
  ) {
    return false;
  }
  return true;
});

//https://excalidraw.com/#room=83325dd1885048312b85,i79qCXYL8xSZid6GT-v8kw
