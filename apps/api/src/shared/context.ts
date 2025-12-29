import { Session, User } from "better-auth/types";

export interface Context {
  Variables: {
    user: User | null;
    session: Session | null;
    userId: string;
  };
}
