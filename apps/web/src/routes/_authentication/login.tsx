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

export const Route = createFileRoute("/_authentication/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Let's take you to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthenticationForm type="login" />
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
