import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { httpPost } from "@/api/http";
import { toast } from "sonner";
import { WINDOW_EVENTS } from "@/constants";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "../ui/field";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button, buttonVariants } from "../ui/button";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/classname";
import { VariantProps } from "class-variance-authority";

const newChatFormSchema = z.object({
  name: z.string().min(1, "Chat name is required"),
  visibility: z.string().default("public"),
});

export interface CreateRoomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const CreateRoomButton = React.forwardRef<
  HTMLButtonElement,
  CreateRoomButtonProps
>(({ children, asChild, variant, size, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

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
    <>
      <Comp
        onClick={() => setIsDialogOpen(true)}
        ref={ref}
        {...props}
        className={cn(buttonVariants({ variant, size, className }))}
      >
        {children}
      </Comp>

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
    </>
  );
});
CreateRoomButton.displayName = "CreateRoomButton";

export default CreateRoomButton;
