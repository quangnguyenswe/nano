
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";

export default function ThemeSwitch({
  className,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "variant">) {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      className="h-8 rounded-full has-[>svg]:px-3"
      size="sm"
      variant="outline"
      onClick={(e) => {
        setTheme(theme === "dark" ? "light" : "dark");
        onClick?.(e);
      }}
      {...props}
    >
      {theme === "dark" ? (
        <>
          <Moon size={13.5} suppressHydrationWarning />
          <span className="sr-only">Switch to light mode</span>
        </>
      ) : (
        <>
          <Sun size={13.5} suppressHydrationWarning />
          <span className="sr-only">Switch to dark mode</span>
        </>
      )}
    </Button>
  );
}
