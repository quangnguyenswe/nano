import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { saveRoomToChatList } from "@/data/localStorage";
import { nanoid } from "nanoid";
import useAuth from "@/hooks/use-auth";

export const Route = createFileRoute("/_layout/_chat/chat/new")({
  component: RouteComponent,
});

const newChatFormSchema = z.object({
  name: z.string().min(1, "Chat name is required"),
});

function RouteComponent() {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof newChatFormSchema>>({
    resolver: zodResolver(newChatFormSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(values: z.infer<typeof newChatFormSchema>) {
    const chatId = nanoid(); // Change this with encrypted key later
    saveRoomToChatList({
      id: chatId,
      name: values.name,
      creator: user?.id || "unknown",
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      unreadCount: 0,
    });
    window.history.pushState({}, "", `/chat/${chatId}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="container p-4">
        <FieldGroup>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Field>
                    <FieldLabel htmlFor="fieldgroup-name">Chat Name</FieldLabel>
                    <Input
                      id="fieldgroup-name"
                      placeholder="New chat name"
                      {...field}
                    />
                    <FieldDescription>
                      This name will be used to identify your chat.
                    </FieldDescription>
                  </Field>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* TODO Emails fields to invite other users to the chat */}
          {/* <Field>
          <FieldLabel htmlFor="fieldgroup-email">Email</FieldLabel>
          <Input
            id="fieldgroup-email"
            type="email"
            placeholder="name@example.com"
          />
          <FieldDescription>
            We&apos;ll send updates to this address.
          </FieldDescription>
        </Field> */}
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
          </Field>
        </FieldGroup>
      </form>
    </Form>
  );
}
