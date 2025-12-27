import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/classname";
import { Google } from "@/icons/Google";
import { Spinner } from "../Spinner";

type GoogleButtonProps = {
  isDisabled?: boolean;
  setIsDisabled?: (isDisabled: boolean) => void;
  className?: string;
};

const GOOGLE_REDIRECT_AT = "googleRedirectAt";
const GOOGLE_LAST_PAGE = "googleLastPage";

export default function GoogleButton(props: GoogleButtonProps) {
  const { isDisabled, setIsDisabled, className } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setIsLoading(true);
    setIsDisabled?.(true);

    if (!["/login", "/signup"].includes(window.location.pathname)) {
      const pagePath = ["/c"].includes(window.location.pathname)
        ? window.location.pathname + window.location.search
        : window.location.pathname;

      localStorage.setItem(GOOGLE_REDIRECT_AT, Date.now().toString());
      localStorage.setItem(GOOGLE_LAST_PAGE, pagePath);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        disabled={isLoading || isDisabled}
        onClick={handleClick}
        className={cn("w-full hover:border-gray-400", className)}
      >
        {isLoading ? (
          <Spinner className={"h-4.5 w-4.5"} />
        ) : (
          <Google className={"h-4.5 w-4.5"} />
        )}
        Continue with Google
      </Button>
    </>
  );
}
