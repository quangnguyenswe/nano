import AuthenticationForm from "@/components/Authentication/AuthenticationForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/classname";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authentication/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Getting started is easy. Let's create your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthenticationForm type="signup" />
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
