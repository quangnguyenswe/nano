import { create } from "zustand";

export type MembershipRole = "owner" | "admin" | "member" | "guest";

interface MembershipState {
  role: MembershipRole;
}

interface MembershipActions {
  setRole: (role: MembershipState["role"]) => void;
}

export const useMembershipStore = create<MembershipState & MembershipActions>(
  (set) => ({
    role: "guest",
    setRole: (role) => set(() => ({ role })),
  }),
);

export const useMembershipRole = () =>
  useMembershipStore((state) => state.role);
