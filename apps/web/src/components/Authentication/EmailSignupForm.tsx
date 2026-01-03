import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Field, FieldDescription } from "../ui/field";
import { Button } from "../ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type EmailSignUpFormProps = {
  isDisabled: boolean;
  setIsDisabled: (disabled: boolean) => void;
};

const emailLoginFormSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.email(),
  password: z.string().min(8),
});

export default function EmailSignupForm(props: EmailSignUpFormProps) {
  const { isDisabled, setIsDisabled } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { history } = useRouter();

  const form = useForm<z.infer<typeof emailLoginFormSchema>>({
    resolver: zodResolver(emailLoginFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof emailLoginFormSchema>) {
    setIsLoading(true);
    setIsDisabled(true);
    try {
      const result = await authClient.signUp.email({
        email: data.email,
        name: data.name,
        password: data.password,
        callbackURL: `${import.meta.env.VITE_CLIENT_URL}/chat`,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to sign up");
        return;
      }

      toast.success("Account created successfully");
      setTimeout(() => {
        history.push(`/verification?email=${encodeURIComponent(data.email)}`);
      }, 500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign up");
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Your name"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="me@example.com"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Password"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <a
          // to="/forgot-password"
          className="text-sm underline-offset-4 hover:underline text-blue-600 block text-right"
        >
          Forgot your password?
        </a>
        <Field>
          <Button
            type="submit"
            disabled={isDisabled || isLoading}
            className="cursor-pointer"
          >
            Continue
          </Button>
          <FieldDescription className="text-center">
            Already have an account? <Link to="/login">Login</Link>
          </FieldDescription>
        </Field>
      </form>
    </Form>
  );
}
