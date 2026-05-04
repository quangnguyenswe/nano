import { createContext, type PropsWithChildren } from "react";
import { User } from "better-auth/types";
import LoadingPage from "@/components/LoadingPage";
import { useSessionQuery } from "@/hooks/use-auth";

export const AuthContext = createContext<{
  user: User | null | undefined;
  isLoading: boolean;
}>({
  user: undefined,
  isLoading: true,
});

function AuthProvider({ children }: PropsWithChildren) {
  const { data, isPending } = useSessionQuery()

  if (isPending) {
    return <LoadingPage initialMessage="Loading" />;
  }

  return (
    <AuthContext.Provider value={{ user: data?.user, isLoading: isPending }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
