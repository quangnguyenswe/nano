import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });
}

export default useSignOut;
