import { AnimatePresence } from "motion/react";
import { useMemo } from "react";
import { toast } from "sonner";
import { QuestItem } from "@app/quests/components/QuestItem";
import { UnlaunchedSummary } from "@app/quests/components/UnlaunchedSummary";
import { EmptyState } from "@app/shared/components/EmptyState";
import { ErrorNote } from "@app/shared/components/ErrorNote";
import { LoadState } from "@app/shared/components/LoadState";
import { PageHeader } from "@app/shared/components/PageHeader";
import { isNeverLaunched } from "@app/shared/utils/value";
import { useCopies, useUpdateCopy } from "@/api/games/hooks";

export function QuestsPage() {
  const copies = useCopies();
  const update = useUpdateCopy();
  const quests = useMemo(
    () => (copies.data ?? []).filter(isNeverLaunched).sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [copies.data],
  );

  return (
    <section>
      <PageHeader eyebrow="Quest log" title="Never launched">
        {quests.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {quests.length} {quests.length === 1 ? "game is" : "games are"} waiting for a first session.
          </p>
        ) : null}
      </PageHeader>

      <UnlaunchedSummary />

      {copies.isPending ? (
        <LoadState />
      ) : copies.isError ? (
        <LoadState error retry={() => void copies.refetch()} />
      ) : quests.length === 0 ? (
        <EmptyState title="Quest log clear">
          <p className="max-w-sm text-sm text-muted-foreground">
            Every game you meant to play has been started. Games you add as “to play” land here until their first hour.
          </p>
        </EmptyState>
      ) : (
        <ol className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {quests.map((copy, index) => (
              <QuestItem
                key={copy.id}
                copy={copy}
                position={index + 1}
                busy={update.isPending}
                onCollect={() =>
                  update.mutate(
                    { copy, intent: "to_own" },
                    { onSuccess: () => toast(`${copy.title} moved to your collection`) },
                  )
                }
                onStart={() =>
                  update.mutate(
                    { copy, status: "playing" },
                    { onSuccess: () => toast.success(`Quest started: ${copy.title}`) },
                  )
                }
              />
            ))}
          </AnimatePresence>
        </ol>
      )}

      {update.isError ? <ErrorNote className="mt-4">Could not update that game. Try again.</ErrorNote> : null}
    </section>
  );
}
