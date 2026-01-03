import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/classname";
import { Google } from "@/icons/Google";
import { Spinner } from "../Spinner";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

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
  const navigate = useNavigate();

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
    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${import.meta.env.VITE_CLIENT_URL}/chat`,
        errorCallbackURL: `${import.meta.env.VITE_CLIENT_URL}/login`,
      });
      if (res.error) {
        toast.error(
          res.error.message ||
            "Failed to redirect to Google. Please try again.",
        );
      }
      const googleRedirectAt = localStorage.getItem(GOOGLE_REDIRECT_AT);
      const lastPageBeforeGoogle = localStorage.getItem(GOOGLE_LAST_PAGE);
      // If the social redirect is there and less than 30 seconds old
      // redirect to the page that user was on before they clicked the github login button
      if (googleRedirectAt && lastPageBeforeGoogle) {
        const socialRedirectAtTime = parseInt(googleRedirectAt, 10);
        const now = Date.now();
        const timeSinceRedirect = now - socialRedirectAtTime;

        toast.success("Signed in with Google");
        if (timeSinceRedirect < 30 * 1000) {
          navigate({ to: lastPageBeforeGoogle || "/" });
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google",
      );
    } finally {
      setIsLoading(false);
      setIsDisabled?.(false);
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
