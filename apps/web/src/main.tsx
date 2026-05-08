import "./global.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { queryClient } from "./lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "./providers/auth";
import useAuth from "./hooks/use-auth";
import LoadingPage from "./components/LoadingPage";
import { ThemeProvider } from "./components/theme-provider";
import { UI_THEME_KEY } from "./constants";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  context: {
    user: null,
    queryClient,
  },
  defaultPendingComponent: () => <LoadingPage initialMessage="Loading" />,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const { user } = useAuth();

  return (
    <ThemeProvider defaultTheme="dark" storageKey={UI_THEME_KEY}>
      <RouterProvider router={router} context={{ user }} />
    </ThemeProvider>
  );
}

const rootElement = document.getElementById("root") as HTMLElement;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    // <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    // </StrictMode>,
  );
}
