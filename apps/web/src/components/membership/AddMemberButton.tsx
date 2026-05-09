import { useState } from "react";
import { MemberCommand } from "./MemberCommand";
import { Button } from "../ui/button";
import { cn } from "@/lib/classname";
import { UserPlus } from "lucide-react";

type AddMemberButtonProps = {
  chatId: string;
};

export default function AddMemberButton(props: AddMemberButtonProps) {
  const { chatId } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Button
        className={cn("h-8 px-2 md:h-fit md:px-2")}
        data-testid="sidebar-toggle-button"
        variant="outline"
        onClick={() => setIsOpen(true)}
      >
        <UserPlus size={16} />
      </Button>

      <MemberCommand
        open={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
        chatId={chatId}
      />
    </div>
  );
}
