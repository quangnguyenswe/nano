import { User } from "better-auth/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import useSignOut from "@/hooks/use-signout";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import { usePageStore } from "@/store/page";

type AccountDropdownProps = {
  user: User;
};

export default function AccountDropdown(props: AccountDropdownProps) {
  const { user } = props;
  const { mutateAsync: signOut, isPending } = useSignOut();
  const { setPageProgressMessage } = usePageStore();
  const handleSignOut = async () => {
    try {
      await signOut();
      queryClient.clear();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sign out",
      );
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0 h-full">
          <Avatar className="h-8 w-8 rounded-md cursor-pointer">
            <AvatarImage
              src={user?.image || "/images/default-avatar.png"}
              alt={user.name}
            />
            <AvatarFallback className="rounded-lg">
              {user.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="font-medium">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setPageProgressMessage("Loading profile")}>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isPending}>
          {isPending ? "Signing Out..." : "Sign Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
