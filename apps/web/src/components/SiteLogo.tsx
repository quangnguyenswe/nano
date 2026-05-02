import { cn } from "@/lib/classname";
import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

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
      <div className="bg-brand text-primary-foreground flex size-8 items-center justify-center rounded-md">
        <MessageCircle className="size-5 text-white" />
      </div>
      <span className="text-xl font-semibold font-mono">nano</span>
    </Link>
  );
}
