import { Link } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";
import { Button } from "../ui/button";
import SiteLogo from "../SiteLogo";
import useAuth from "@/hooks/use-auth";
import ThemeSwitch from "../theme-switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
//Talk. Connect. Decide.
export default function Navigation() {
  const { user } = useAuth();
  const navigationData = [
    { title: "Home", href: "/" },
    { title: "Features", href: "/features" },
    { title: "Pricing", href: "/pricing" },
    { title: "Contact", href: "/contact" },
  ];
  return (
    <header className="bg-background/60 sticky top-0 z-30 flex min-h-16 w-full shrink-0 items-center justify-center border-b border-dashed backdrop-blur-[8px] py-2">
      <div className="mx-auto flex h-full w-full max-w-350 items-center border-dashed min-[1400px]:border-x min-[1800px]:max-w-384">
        <div className="flex w-full items-center justify-between max-lg:gap-4 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            {/* {toggle} */}
            <SiteLogo />
          </div>
          <div className="md:flex items-center justify-end gap-2 sm:gap-6 lg:justify-between hidden ">
            {/* <NavMenu /> */}
            <div className="flex items-center gap-2 lg:gap-4">
              <ThemeSwitch />
              {/* <ThemeCustomizer /> */}
              {/* <ModeToggle /> */}
              <div className="flex items-center gap-2">
                {user ? (
                  <Button asChild size={"sm"} variant={"default"}>
                    <Link to="/chat">Let's Chat</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size={"sm"} variant={"outline"}>
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                    <Button asChild size={"sm"} variant={"default"}>
                      <Link to="/login">Log In</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-4 md:hidden">
            <Button className="rounded-lg" asChild>
              <Link to="/login">Login</Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuIcon />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {navigationData.map((item, index) => (
                  <DropdownMenuItem key={index}>
                    <Link to={item.href}>{item.title}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
