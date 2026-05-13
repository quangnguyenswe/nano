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
import { Check, Mail, User2, XIcon } from "lucide-react";
import { httpGet, httpPut } from "@/api/http";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";

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

  const handleRequestAction = async (
    requestId: string,
    action: "accept" | "reject",
  ) => {
    const { response, error } = await httpPut<{ message: string }>(
      `/membership/handle-request/${chatId}`,
      {
        requestId,
        approve: action === "accept",
      },
    );
    if (error || !response) {
      toast.error(`Failed to ${action} the request`);
      return;
    }
    toast.success(response.message);
    // Refresh the requests list after action
    fetchRequests();
  };

  useEffect(() => {
    if (open) {
      fetchRequests();
    }
  }, [open, chatId]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setSearch("");
        }
        onOpenChange(open);
      }}
    >
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
          <CommandEmpty>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <User2 />
                </EmptyMedia>
                <EmptyTitle>No results found</EmptyTitle>
                <EmptyDescription>
                  We couldn't find any users matching your search.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CommandEmpty>
          {filteredUsers.length > 0 && (
            <CommandGroup heading="Requests" className="p-2">
              {filteredUsers.map((request) => (
                <CommandItem key={request.id} className={`cursor-pointer`}>
                  <div className="flex w-full items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.avatar} alt={request.name} />
                      <AvatarFallback>
                        {request.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">
                          {request.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{request.email}</span>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={"default"}
                        onClick={() =>
                          handleRequestAction(request.id, "accept")
                        }
                      >
                        <Check className="h-3 w-3 md:hidden" />
                        <span className="hidden md:block">Accept</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={"destructive"}
                        onClick={() =>
                          handleRequestAction(request.id, "reject")
                        }
                      >
                        <XIcon className="h-3 w-3 md:hidden" />
                        <span className="hidden md:block">Reject</span>
                      </Button>
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
