import React from "react";

const TanStackQueryDevtools =
  import.meta.env.VITE_NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/react-query-devtools").then((res) => ({
          default: res.ReactQueryDevtools,
        })),
      );

export default TanStackQueryDevtools;