import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Field, FieldDescription } from "../ui/field";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

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

  const form = useForm<z.infer<typeof emailLoginFormSchema>>({
    resolver: zodResolver(emailLoginFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof emailLoginFormSchema>) {
    console.log(values);
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
            Login
          </Button>
          <FieldDescription className="text-center">
            Already have an account? <Link to="/login">Login</Link>
          </FieldDescription>
        </Field>
      </form>
    </Form>
  );
}
