import { Field, FieldGroup, FieldSeparator } from "../ui/field";
import { useState } from "react";
import EmailLoginForm from "./EmailLoginForm";
import EmailSignupForm from "./EmailSignupForm";
import GoogleButton from "./GoogleButton";
import FacebookButton from "./FacebookButton";
import DiscordButton from "./DiscordButton";

type AuthenticationFormProps = {
  type: "login" | "signup";
};

export default function AuthenticationForm(props: AuthenticationFormProps) {
  const { type } = props;
  const [isDisabled, setIsDisabled] = useState(false);
  return (
    <div>
      <FieldGroup>
        <Field>
          <GoogleButton isDisabled={isDisabled} setIsDisabled={setIsDisabled} />
          <FacebookButton
            isDisabled={isDisabled}
            setIsDisabled={setIsDisabled}
          />
          <DiscordButton
            isDisabled={isDisabled}
            setIsDisabled={setIsDisabled}
          />
        </Field>
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>
        {type === "login" ? (
          <EmailLoginForm
            isDisabled={isDisabled}
            setIsDisabled={setIsDisabled}
          />
        ) : (
          <EmailSignupForm
            isDisabled={isDisabled}
            setIsDisabled={setIsDisabled}
          />
        )}
      </FieldGroup>
    </div>
  );
}
