import { useQueryClient } from "@tanstack/react-query";
import { useUserId } from "@/providers/useSession";

/** Every key includes the user id, so one account's cache can never be shown to another. */
export const queryKeys = {
  copies: (userId: string) => ["copies", userId] as const,
  purchases: (userId: string) => ["purchases", userId] as const,
  playtime: (userId: string) => ["playtime", userId] as const,
  stats: (userId: string) => ["stats", userId] as const,
  settings: (userId: string) => ["settings", userId] as const,
  igdbSearch: (userId: string, query: string) => ["igdb-search", userId, query] as const,
};

/** Copies, purchases, hours and stats all derive from each other, so any change refetches all of them. */
export function useInvalidateLedger() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return () => {
    for (const key of [queryKeys.copies, queryKeys.purchases, queryKeys.playtime, queryKeys.stats]) {
      void queryClient.invalidateQueries({ queryKey: key(userId) });
    }
  };
}
