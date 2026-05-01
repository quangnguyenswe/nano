import { ChevronsUpDown, Monitor, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { User } from "better-auth/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import { Button } from "../ui/button";
import useSignOut from "@/hooks/use-signout";
import { useTheme } from "../theme-provider";

type SidebarUserProps = {
  user: User;
};

export function SidebarUser(props: SidebarUserProps) {
  const { user } = props;
  const { mutateAsync: signOut } = useSignOut();
  const { theme, setTheme } = useTheme();
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-14 w-full bg-transparent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer text-accent-foreground hover:bg-accent/50 hover:text-accent-foreground shadow-none rounded-none"
              // data-testid="user-nav-button"
            >
              <Avatar className="h-8 w-8 rounded-full cursor-pointer bg-white">
                <AvatarImage
                  src={user?.image || "/images/default-avatar.png"}
                  alt={user.name}
                />
                <AvatarFallback className="rounded-lg">
                  {user.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-50"
            data-testid="user-nav-menu"
            side="top"
            align="end"
          >
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuCheckboxItem
                      checked={theme === "light"}
                      onClick={() => setTheme("light")}
                    >
                      <Sun />
                      Light
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={theme === "dark"}
                      onClick={() => setTheme("dark")}
                    >
                      <Moon />
                      Dark
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={theme === "system"}
                      onClick={() => setTheme("system")}
                    >
                      <Monitor />
                      System
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild data-testid="user-nav-item-auth">
              <button
                className="w-full cursor-pointer"
                onClick={handleSignOut}
                type="button"
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
