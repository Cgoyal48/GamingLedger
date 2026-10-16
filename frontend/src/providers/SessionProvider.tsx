import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/api/supabase";
import { SessionContext, type SessionState } from "./useSession";

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SessionState>({ ready: false, session: null });

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setState({ ready: true, session: data.session });
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setState({ ready: true, session: next });
      if (!next) {
        queryClient.clear();
      }
    });
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [queryClient]);

  return <SessionContext value={state}>{children}</SessionContext>;
}
