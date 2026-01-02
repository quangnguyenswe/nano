import { Letter } from "@/icons/Letter";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authentication/verification")({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState("..");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailResent, setIsEmailResent] = useState(false);

  useEffect(() => {
    //When navigated from registration page, email will be passed as query param
    // ex: /window.location.href = `/verification?email=${encodeURIComponent(
    //   email,
    // )}`;
    const urlParams = new URLSearchParams(window.location.search);

    setEmail(urlParams.get("email")!);
  }, []);

  const resendVerificationEmail = () => {
    return;
  };
  return (
    <section className="container py-8 sm:py-20">
      <div className="mx-auto max-w-md text-center">
        <Letter className="mx-auto mb-4 h-20 w-40 sm:h-40" />
        <h2 className="my-2 text-center text-xl font-semibold sm:my-5 sm:text-2xl">
          Verify your email address
        </h2>
        <div className="text-sm sm:text-base">
          <p>
            We have sent you an email at{" "}
            <span className="font-bold">{email}</span>. Please click the link to
            verify your account. This link will expire shortly, so please verify
            soon!
          </p>

          <hr className="my-4" />

          {!isEmailResent && (
            <>
              {isLoading && (
                <p className="text-gray-400">Sending the email ..</p>
              )}
              {!isLoading && !error && (
                <p>
                  Please make sure to check your spam folder. If you did not
                  receive the email, you can{" "}
                  <button
                    disabled={!email}
                    className="inline text-blue-700"
                    onClick={resendVerificationEmail}
                  >
                    resend verification email.
                  </button>
                </p>
              )}

              {error && <p className="text-red-700">{error}</p>}
            </>
          )}

          {isEmailResent && (
            <p className="text-green-700">Verification email has been sent!</p>
          )}
        </div>
      </div>
    </section>
  );
}
