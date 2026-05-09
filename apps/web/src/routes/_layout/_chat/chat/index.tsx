import { createFileRoute } from "@tanstack/react-router";
import Greeting from "@/components/Chat/Greeting";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Form,
  FormLabel,
} from "@/components/ui/form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { httpPost } from "@/api/http";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WINDOW_EVENTS } from "@/constants";

export const Route = createFileRoute("/_layout/_chat/chat/")({
  component: RouteComponent,
});
const newChatFormSchema = z.object({
  name: z.string().min(1, "Chat name is required"),
  visibility: z.string().default("public"),
});

function RouteComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(newChatFormSchema),
    defaultValues: {
      name: "",
      visibility: "public",
    },
  });

  async function onSubmit(values: z.infer<typeof newChatFormSchema>) {
    const { response, error } = await httpPost("/chat-room/create", {
      name: values.name,
      visibility: values.visibility,
      type: "group",
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(values.name)}&background=random`,
    });

    if (error || !response) {
      toast.error("Failed to create chat room. Please try again.");
      return;
    }
    toast.success("Chat room created successfully!");
    // Notify other parts of the app (sidebar) about the new chat
    try {
      window.dispatchEvent(
        new CustomEvent(WINDOW_EVENTS.CHAT_CREATED, { detail: response }),
      );
    } catch (e) {
      // ignore if CustomEvent isn't supported (very old browsers)
    }
    setIsDialogOpen(false);
    window.history.pushState({}, "", `/chat/${response.id}`);
  }
  return (
    <div className="relative h-full bg-background flex flex-col items-center justify-center gap-10">
      <Greeting />
      <div>
        <Button size={"sm"} onClick={() => setIsDialogOpen(true)}>
          Start Chatting
        </Button>
        <Button size={"sm"} variant="outline" className="ml-2">
          Learn More
        </Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Form {...form}>
          <DialogContent className="sm:max-w-lg">
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <DialogHeader>
                <DialogTitle>Create Chat Room</DialogTitle>
                <DialogDescription>
                  Enter a name for your new chat room.
                </DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Field>
                          <FieldLabel htmlFor="fieldgroup-name">
                            Name
                          </FieldLabel>
                          <Input
                            id="fieldgroup-name"
                            placeholder="e.g. Project Alpha"
                            {...field}
                          />
                        </Field>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="max-w-md flex flex-row space-x-4"
                        >
                          <FieldLabel htmlFor="public">
                            <Field orientation="horizontal">
                              <FieldContent>
                                <FieldTitle>Public</FieldTitle>
                                <FieldDescription>
                                  Anyone can request to join this chat.
                                </FieldDescription>
                              </FieldContent>
                              <RadioGroupItem value="public" id="public" />
                            </Field>
                          </FieldLabel>
                          <FieldLabel htmlFor="private">
                            <Field orientation="horizontal">
                              <FieldContent>
                                <FieldTitle>Private</FieldTitle>
                                <FieldDescription>
                                  Only invited users can join this chat.
                                </FieldDescription>
                              </FieldContent>
                              <RadioGroupItem value="private" id="private" />
                            </Field>
                          </FieldLabel>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldGroup>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="cursor-pointer">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Form>
      </Dialog>
    </div>
  );
}
