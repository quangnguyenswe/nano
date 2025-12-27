import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/classname";
import { Spinner } from "../Spinner";
import Facebook from "@/icons/Facebook";

type FacebookButtonProps = {
  isDisabled?: boolean;
  setIsDisabled?: (isDisabled: boolean) => void;
  className?: string;
};

const FACEBOOK_REDIRECT_AT = "facebookRedirectAt";
const FACEBOOK_LAST_PAGE = "facebookLastPage";

export default function FacebookButton(props: FacebookButtonProps) {
  const { isDisabled, setIsDisabled, className } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setIsLoading(true);
    setIsDisabled?.(true);

    if (!["/login", "/signup"].includes(window.location.pathname)) {
      const pagePath = ["/c"].includes(window.location.pathname)
        ? window.location.pathname + window.location.search
        : window.location.pathname;

      localStorage.setItem(FACEBOOK_REDIRECT_AT, Date.now().toString());
      localStorage.setItem(FACEBOOK_LAST_PAGE, pagePath);
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
          <Facebook className={"h-4.5 w-4.5"} />
        )}
        Continue with Facebook
      </Button>
    </>
  );
}
