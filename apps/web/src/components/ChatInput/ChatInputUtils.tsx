import { Button } from "../ui/button";
import { ImageIcon, Paperclip, Plus } from "lucide-react";
import { cn } from "@/lib/classname";

type ChatInputUtilsProps = {
  input: string;
};
export default function ChatInputUtils(props: ChatInputUtilsProps) {
  const { input } = props;
  const hasInput = input.trim() !== "";

  return (
    <div className="m-1 flex items-center gap-1">
      {/* Plus button - shown when there's input */}
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "rounded-full size-9 hover:bg-accent p-1 transition-[display] duration-200 ease-in-out",
          !hasInput && "hidden",
        )}
      >
        <span className="sr-only">More</span>
        <Plus className="w-5! h-5! text-muted-foreground hover:text-foreground" />
      </Button>

      {/* Paperclip button - shown when there's no input */}
      <div
        className={cn(
          "flex items-center gap-1 transition-all duration-200 ease-in-out",
          hasInput && "hidden",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          className="rounded-full size-9 hover:bg-accent p-1"
        >
          <span className="sr-only">Upload file</span>
          <Paperclip className="w-5! h-5! text-muted-foreground hover:text-foreground" />
        </Button>

        {/* Image button - shown when there's no input */}
        <Button
          type="button"
          variant="ghost"
          className="rounded-full size-9 hover:bg-accent p-1 "
        >
          <span className="sr-only">Upload Image</span>
          <ImageIcon className="w-5! h-5! text-muted-foreground hover:text-foreground" />
        </Button>
      </div>
    </div>
  );
}
