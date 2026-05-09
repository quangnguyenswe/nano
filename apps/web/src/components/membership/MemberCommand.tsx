"use client";

import { memo, useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import { httpGet } from "@/api/http";
import { toast } from "sonner";

type PureMemberCommandProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
};

type MemberRequest = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

function PureMemberCommand(props: PureMemberCommandProps) {
  const { open, onOpenChange, chatId } = props;
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState<MemberRequest[]>([]);

  const fetchRequests = async () => {
    const { response, error } = await httpGet<MemberRequest[]>(
      `/membership/requests/${chatId}`,
    );
    if (error || !response) {
      toast.error("Failed to fetch membership requests");
      return;
    }
    setRequests(response);
  };

  const filteredUsers = requests.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (open) {
      fetchRequests();
    }
  }, [open, chatId]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <div className="flex items-center gap-2 border-b">
          <div className="flex-1">
            <CommandInput
              placeholder="Search a name or email..."
              value={search}
              onValueChange={setSearch}
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
        <CommandList className="active:ring-0">
          <CommandEmpty>No results found.</CommandEmpty>
          {filteredUsers.length > 0 && (
            <CommandGroup heading="Requests" className="p-2">
              {filteredUsers.map((user) => (
                <CommandItem key={user.id} className={`cursor-pointer`}>
                  <div className="flex w-full items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export const MemberCommand = memo(PureMemberCommand, (prevProps, nextProps) => {
  return prevProps.open === nextProps.open;
});
