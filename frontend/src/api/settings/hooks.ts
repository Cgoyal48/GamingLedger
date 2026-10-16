import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/api/client";
import { queryKeys, useInvalidateLedger } from "@/api/queryKeys";
import { useUserId } from "@/providers/useSession";
import type { Currency, Settings } from "./types";

export function useSettings() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.settings(userId),
    queryFn: () => apiFetch<Settings>("/api/settings"),
  });
}

/** INR until settings load, matching the server's default. */
export function useDisplayCurrency(): Currency {
  return useSettings().data?.display_currency ?? "INR";
}

/** Changing the display currency re-values every copy. */
export function useUpdateSettings() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateLedger();
  return useMutation({
    mutationFn: (settings: Settings) => apiFetch<Settings>("/api/settings", { method: "PUT", ...jsonBody(settings) }),
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKeys.settings(userId), saved);
      invalidate();
    },
  });
}
