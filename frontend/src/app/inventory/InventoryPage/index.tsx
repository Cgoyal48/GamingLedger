import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { GameRow } from "@app/inventory/components/GameRow";
import { InventoryFilters } from "@app/inventory/components/InventoryFilters";
import { RemoveGameDialog } from "@app/inventory/components/RemoveGameDialog";
import { useInventoryFilters } from "@app/inventory/hooks/useInventoryFilters";
import { applyFilters, type Sort } from "@app/inventory/utils/filters";
import { EmptyState } from "@app/shared/components/EmptyState";
import { ErrorNote } from "@app/shared/components/ErrorNote";
import { KeyHint } from "@app/shared/components/KeyHint";
import { LoadState } from "@app/shared/components/LoadState";
import { PageHeader } from "@app/shared/components/PageHeader";
import { Segmented } from "@app/shared/components/Segmented";
import { useShellActions } from "@app/shared/hooks/useShellActions";
import { rankByValue } from "@app/shared/utils/value";
import { Button } from "@/components/ui/button";
import { useCopies, useLogPlaytime, useUpdateCopy } from "@/api/games/hooks";
import type { Copy } from "@/api/games/types";

const sortOptions: { value: Sort; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "value", label: "Best value" },
  { value: "title", label: "A–Z" },
];

export function InventoryPage() {
  const copies = useCopies();
  const update = useUpdateCopy();
  const playtime = useLogPlaytime();
  const actions = useShellActions();
  const { filters, active, set, clear } = useInventoryFilters();
  const [removing, setRemoving] = useState<Copy | null>(null);

  const all = useMemo(() => copies.data ?? [], [copies.data]);
  const { unlocked, ranks } = useMemo(() => rankByValue(all), [all]);
  const shown = useMemo(() => applyFilters(all, filters), [all, filters]);

  const busyId = update.isPending ? update.variables?.copy.id : playtime.isPending ? playtime.variables?.id : undefined;

  return (
    <section>
      <PageHeader eyebrow="Inventory" title="Your games">
        {all.length > 1 ? (
          <Segmented
            label="Sort games"
            value={filters.sort}
            onChange={(sort) => set("sort", sort === "recent" ? null : sort)}
            options={sortOptions}
          />
        ) : null}
      </PageHeader>

      {all.length > 1 || active > 0 ? (
        <InventoryFilters
          copies={all}
          filters={filters}
          shown={shown.length}
          active={active}
          onChange={set}
          onClear={clear}
        />
      ) : null}

      {copies.isPending ? (
        <LoadState />
      ) : copies.isError ? (
        <LoadState error retry={() => void copies.refetch()} />
      ) : all.length === 0 ? (
        <EmptyState title="No games yet">
          <p className="max-w-sm text-sm text-muted-foreground">
            Add a game, enter your hours, and watch every session bring its cost per hour down.
          </p>
          <Button onClick={actions.addGame} className="mt-2">
            Add your first game{" "}
            <KeyHint onPrimary className="ml-1">
              N
            </KeyHint>
          </Button>
        </EmptyState>
      ) : shown.length === 0 ? (
        <EmptyState title="No games match">
          <Button variant="outline" onClick={clear} className="mt-2">
            Clear filters
          </Button>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {shown.map((copy) => (
              <GameRow
                key={copy.id}
                copy={copy}
                rank={ranks.get(copy.id)}
                ranksUnlocked={unlocked}
                busy={busyId === copy.id}
                onHours={(minutes) => playtime.mutate({ id: copy.id, minutes })}
                onStatus={(status) => update.mutate({ copy, status })}
                onEdit={() => actions.editGame(copy)}
                onLogPurchase={() => actions.logPurchase(copy.id)}
                onRemove={() => setRemoving(copy)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {update.isError || playtime.isError ? (
        <ErrorNote className="mt-4">Could not save that change. Try again.</ErrorNote>
      ) : null}

      <RemoveGameDialog copy={removing} onClose={() => setRemoving(null)} />
    </section>
  );
}
