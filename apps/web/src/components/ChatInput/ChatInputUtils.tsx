import { Button } from "../ui/button";
import { ImageIcon, Paperclip, Plus } from "lucide-react";
import { cn } from "@/lib/classname";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type ChatInputUtilsProps = {
  disabled?: boolean;
};
export default function ChatInputUtils(props: ChatInputUtilsProps) {
  const { disabled } = props;
  return (
    <div className="m-1 flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={disabled}
            type="button"
            variant="ghost"
            title="Open more actions"
            className={cn("rounded-full size-9 hover:bg-accent p-1")}
          >
            <span className="sr-only">More</span>
            <Plus className="w-5! h-5! text-muted-foreground hover:text-foreground" />
          </Button>
        </DropdownMenuTrigger>
        {/* Dropdown menu content goes here */}
        <DropdownMenuContent align="start">
          <DropdownMenuItem>
            <Paperclip className="w-4 h-4 mr-2" /> Attach a File
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ImageIcon className="w-4 h-4 mr-2" /> Upload Image
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
