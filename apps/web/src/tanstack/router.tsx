import React from "react";

const TanStackRouterDevtools =
  import.meta.env.VITE_NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/react-router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

export default TanStackRouterDevtools;