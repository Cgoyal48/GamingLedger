import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useUserId } from "@/providers/useSession";
import type { IgdbMatch } from "./types";

export function useIgdbSearch(query: string) {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.igdbSearch(userId, query),
    queryFn: () => apiFetch<IgdbMatch[]>(`/api/games/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    staleTime: 5 * 60_000,
  });
}
