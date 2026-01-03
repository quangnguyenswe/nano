import { cn } from "@/lib/classname";
import { Link } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";

type SiteLogoProps = {
  className?: string;
};

export default function SiteLogo(props: SiteLogoProps) {
  const { className } = props;
  return (
    <Link
      to="/"
      className={cn(
        `flex items-center gap-2 self-center font-medium`,
        className,
      )}
    >
      <div className="bg-teal-500 text-primary-foreground flex size-8 items-center justify-center rounded-md">
        <MessagesSquare className="size-5" />
      </div>
      <span className="text-xl font-semibold font-mono">Huddle</span>
    </Link>
  );
}
