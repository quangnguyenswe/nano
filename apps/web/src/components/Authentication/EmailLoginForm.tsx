import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Field, FieldDescription } from "../ui/field";
import { Button } from "../ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const emailLoginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type EmailLoginFormProps = {
  isDisabled?: boolean;
  setIsDisabled: (disabled: boolean) => void;
};

export default function EmailLoginForm(props: EmailLoginFormProps) {
  const { isDisabled, setIsDisabled } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const form = useForm<z.infer<typeof emailLoginFormSchema>>({
    resolver: zodResolver(emailLoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof emailLoginFormSchema>) {
    setIsLoading(true);
    setIsDisabled(true);
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to sign in");
        return;
      }

      toast.success("Logged in successfully");
      navigate({ to: "/chat/new"});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
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
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    autoComplete="c"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
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
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </FieldDescription>
        </Field>
      </form>
    </Form>
  );
}
