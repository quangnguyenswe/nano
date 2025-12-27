import { Link } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useState } from "react";
import SiteLogo from "./SiteLogo";
//Talk. Connect. Decide.
export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="z-20 h-14 bg-sidebar sticky top-0 w-full">
      <div className="relative">
        <nav className="flex flex-1 justify-start items-center w-full px-4 h-14">
          <SiteLogo />
          <div className="flex-row items-center justify-end gap-2 flex-1 hidden md:flex">
            <Button
              size={"sm"}
              variant={"ghost"}
              className="text-sm text-gray-950 dark:text-white hover:bg-gray-200 hover:text-accent-foreground rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:focus-visible:outline-white"
              // to="/signup"
            >
              Sign Up
            </Button>
            <Button
              size={"sm"}
              className="rounded-md bg-teal-500 text-sm/6 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:bg-teal-500 dark:text-white dark:focus-visible:outline-white hover:bg-teal-600"
              // to="/login"
            >
              Log In
            </Button>
          </div>
          <div className="flex flex-1 justify-end md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shadow-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <MenuIcon className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="mb-2">
                <SheetHeader>
                  <SheetTitle>
                    <SiteLogo />
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigation
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 p-4">
                  {/* {user ? (
                <>
                  <span>user: {user}</span>
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="bg-secondary-foreground text-primary-foreground hover:bg-secondary-foreground/70"
                  >
                    <a href="api/auth/logout">Log out</a>
                  </Button>
                </>
              ) : ( */}
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      {/* <Link onClick={() => setIsOpen(false)} to="/login"> */}
                      Sign up
                      {/* </Link> */}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-teal-500 text-primary-foreground hover:bg-teal-500/70"
                    >
                      {/* <Link onClick={() => setIsOpen(false)} to="/login"> */}
                      Log in
                      {/* </Link> */}
                    </Button>
                  </>
                  {/* )} */}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
