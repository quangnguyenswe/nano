import { Link } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";

export default function SiteLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 self-center font-medium">
      <div className="bg-teal-500 text-primary-foreground flex size-6 items-center justify-center rounded-md">
        <MessagesSquare className="size-4" />
      </div>
      <span className="text-xl font-semibold font-mono">Huddle</span>
    </Link>
  );
}
