import { type ComponentProps, memo } from "react";
import Markdown from "react-markdown";

type ResponseProps = ComponentProps<typeof Markdown>;

export const Response = memo(
  ({ ...props }: ResponseProps) => <Markdown {...props} />,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

Response.displayName = "Response";
