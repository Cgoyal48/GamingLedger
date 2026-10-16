import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/api/client";
import { queryKeys, useInvalidateLedger } from "@/api/queryKeys";
import { useUserId } from "@/providers/useSession";
import type { Copy, CopyRequest, NewCopyRequest, PlaySession } from "./types";

export function useCopies() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.copies(userId),
    queryFn: () => apiFetch<Copy[]>("/api/games"),
  });
}

export function useCreateCopy() {
  const invalidate = useInvalidateLedger();
  return useMutation({
    mutationFn: (body: NewCopyRequest) => apiFetch<Copy>("/api/games", { method: "POST", ...jsonBody(body) }),
    onSuccess: invalidate,
  });
}

/** Sends the whole copy, so fields left out of `changes` keep their current values. */
export function useUpdateCopy() {
  const invalidate = useInvalidateLedger();
  return useMutation({
    mutationFn: ({ copy, ...changes }: { copy: Copy } & Partial<CopyRequest>) => {
      const body: CopyRequest = {
        title: copy.title,
        igdb_id: copy.igdb_id,
        platform: copy.platform,
        status: copy.status,
        intent: copy.intent,
        acquisition: copy.acquisition,
        ...changes,
      };
      return apiFetch<Copy>(`/api/games/${copy.id}`, { method: "PUT", ...jsonBody(body) });
    },
    onSuccess: invalidate,
  });
}

export function useDeleteCopy() {
  const invalidate = useInvalidateLedger();
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/api/games/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}

export function useLogPlaytime() {
  const invalidate = useInvalidateLedger();
  return useMutation({
    mutationFn: ({ id, minutes }: { id: number; minutes: number }) =>
      apiFetch<unknown>(`/api/games/${id}/playtime`, { method: "POST", ...jsonBody({ minutes }) }),
    onSuccess: invalidate,
  });
}

/** Every hours entry, newest first. */
export function usePlayHistory() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.playtime(userId),
    queryFn: () => apiFetch<PlaySession[]>("/api/playtime"),
  });
}
