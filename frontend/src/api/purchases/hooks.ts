import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiFetch, jsonBody } from "@/api/client";
import { queryKeys, useInvalidateLedger } from "@/api/queryKeys";
import { useUserId } from "@/providers/useSession";
import type { Purchase, PurchaseRequest } from "./types";

export function usePurchases() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.purchases(userId),
    queryFn: () => apiFetch<Purchase[]>("/api/purchases"),
  });
}

/** Copies whose game purchase is already logged, ignoring `exceptId` (the purchase being edited). */
export function useBoughtCopyIds(exceptId?: number) {
  const purchases = usePurchases();
  return useMemo(
    () =>
      new Set(
        (purchases.data ?? [])
          .filter((purchase) => purchase.kind === "game" && purchase.id !== exceptId)
          .map((purchase) => purchase.copy_id),
      ),
    [purchases.data, exceptId],
  );
}

export function useCreatePurchase() {
  const invalidate = useInvalidateLedger();
  return useMutation({
    mutationFn: (purchase: PurchaseRequest) =>
      apiFetch<Purchase>("/api/purchases", { method: "POST", ...jsonBody(purchase) }),
    onSuccess: invalidate,
  });
}

export function useUpdatePurchase() {
  const invalidate = useInvalidateLedger();
  return useMutation({
    mutationFn: ({ id, ...purchase }: Purchase) =>
      apiFetch<Purchase>(`/api/purchases/${id}`, { method: "PUT", ...jsonBody(purchase) }),
    onSuccess: invalidate,
  });
}

export function useDeletePurchase() {
  const invalidate = useInvalidateLedger();
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/api/purchases/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}
