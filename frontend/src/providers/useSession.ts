import type { Session } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

export type SessionState = { ready: boolean; session: Session | null };

export const SessionContext = createContext<SessionState>({ ready: false, session: null });

export function useSession() {
  return useContext(SessionContext);
}

/** Only call inside signed-in routes. */
export function useUserId() {
  const { session } = useSession();
  if (!session) {
    throw new Error("useUserId called while signed out");
  }
  return session.user.id;
}
