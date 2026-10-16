import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useUserId } from "@/providers/useSession";
import type { Stats } from "./types";

export function useStats() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.stats(userId),
    queryFn: () => apiFetch<Stats>("/api/stats"),
  });
}
