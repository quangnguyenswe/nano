import { createContext, type PropsWithChildren } from "react";
import { authClient } from "@/lib/auth-client";
import { User } from "better-auth/types";
import LoadingPage from "@/components/LoadingPage";

const { useSession } = authClient;

export const AuthContext = createContext<{
  user: User | null | undefined;
  isLoading: boolean;
}>({
  user: undefined,
  isLoading: true,
});

function AuthProvider({ children }: PropsWithChildren) {
  const { data, isPending } = useSession();

  if (isPending) {
    return <LoadingPage initialMessage="Loading..." />;
  }

  return (
    <AuthContext.Provider value={{ user: data?.user, isLoading: isPending }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
