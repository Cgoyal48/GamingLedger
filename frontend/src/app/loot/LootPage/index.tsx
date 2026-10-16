import { AnimatePresence } from "motion/react";
import { useMemo } from "react";
import { toast } from "sonner";
import { PurchaseItem } from "@app/loot/components/PurchaseItem";
import { groupByMonth } from "@app/loot/utils/months";
import { EmptyState } from "@app/shared/components/EmptyState";
import { ErrorNote } from "@app/shared/components/ErrorNote";
import { KeyHint } from "@app/shared/components/KeyHint";
import { LoadState } from "@app/shared/components/LoadState";
import { PageHeader } from "@app/shared/components/PageHeader";
import { useShellActions } from "@app/shared/hooks/useShellActions";
import { labels } from "@app/shared/constants/labels";
import { Button } from "@/components/ui/button";
import { useCopies } from "@/api/games/hooks";
import { useDeletePurchase, usePurchases } from "@/api/purchases/hooks";
import type { Purchase } from "@/api/purchases/types";

export function LootPage() {
  const purchases = usePurchases();
  const copies = useCopies();
  const remove = useDeletePurchase();
  const actions = useShellActions();

  const titles = useMemo(() => new Map((copies.data ?? []).map((copy) => [copy.id, copy.title])), [copies.data]);
  const months = useMemo(() => groupByMonth(purchases.data ?? []), [purchases.data]);

  function describe(purchase: Purchase) {
    return purchase.copy_id == null
      ? labels.top_up
      : `${titles.get(purchase.copy_id) ?? "Game"} · ${labels[purchase.kind]}`;
  }

  return (
    <section>
      <PageHeader eyebrow="Loot log" title="Purchases">
        <Button onClick={() => actions.logPurchase()}>
          Log purchase{" "}
          <KeyHint onPrimary className="ml-1">
            L
          </KeyHint>
        </Button>
      </PageHeader>

      {purchases.isPending ? (
        <LoadState />
      ) : purchases.isError ? (
        <LoadState error retry={() => void purchases.refetch()} />
      ) : months.size === 0 ? (
        <EmptyState title="No loot logged">
          <p className="max-w-sm text-sm text-muted-foreground">
            Log what a game cost and its cost per hour appears in your inventory.
          </p>
        </EmptyState>
      ) : (
        <div className="panel mx-auto max-w-3xl px-6 py-5">
          {[...months].map(([month, items]) => (
            <div key={month} className="mb-5 last:mb-0">
              <h2 className="hud-label mb-2 border-b border-dashed border-border pb-2">{month}</h2>
              <ul>
                <AnimatePresence initial={false}>
                  {items.map((purchase) => (
                    <PurchaseItem
                      key={purchase.id}
                      purchase={purchase}
                      what={describe(purchase)}
                      busy={remove.isPending}
                      onEdit={() => actions.editPurchase(purchase)}
                      onDelete={() => remove.mutate(purchase.id, { onSuccess: () => toast("Purchase deleted") })}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          ))}
          <p className="hud-label mt-4 border-t border-dashed border-border pt-3 text-center">
            Amounts shown in the currency you paid
          </p>
        </div>
      )}

      {remove.isError ? <ErrorNote className="mt-4">Could not delete that purchase.</ErrorNote> : null}
    </section>
  );
}
