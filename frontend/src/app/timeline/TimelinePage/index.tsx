import { useMemo } from "react";
import { EmptyState } from "@app/shared/components/EmptyState";
import { LoadState } from "@app/shared/components/LoadState";
import { PageHeader } from "@app/shared/components/PageHeader";
import { formatHours } from "@app/shared/utils/hours";
import { TimelineItem } from "@app/timeline/components/TimelineItem";
import { buildTimeline } from "@app/timeline/utils/timeline";
import { useCopies, usePlayHistory } from "@/api/games/hooks";
import { usePurchases } from "@/api/purchases/hooks";
import { cn } from "@/lib/utils";

export function TimelinePage() {
  const copies = useCopies();
  const purchases = usePurchases();
  const sessions = usePlayHistory();
  const queries = [copies, purchases, sessions];

  const months = useMemo(
    () => buildTimeline(purchases.data ?? [], sessions.data ?? [], copies.data ?? []),
    [purchases.data, sessions.data, copies.data],
  );

  return (
    <section>
      <PageHeader eyebrow="Timeline" title="Money and time">
        <div className="flex gap-4 text-xs text-muted-foreground" aria-hidden>
          <Legend className="bg-amber">Purchases</Legend>
          <Legend className="bg-primary">Hours</Legend>
        </div>
      </PageHeader>

      {queries.some((query) => query.isPending) ? (
        <LoadState />
      ) : queries.some((query) => query.isError) ? (
        <LoadState error retry={() => queries.forEach((query) => void query.refetch())} />
      ) : months.length === 0 ? (
        <EmptyState title="Nothing on the timeline yet">
          <p className="max-w-sm text-sm text-muted-foreground">
            Log a purchase or some hours and they appear here, month by month, side by side.
          </p>
        </EmptyState>
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {months.map((month) => (
            <section key={month.key} aria-label={month.label} className="panel px-5 py-4">
              <header className="mb-3 flex items-baseline justify-between border-b border-dashed border-border pb-2">
                <h2 className="hud-label">{month.label}</h2>
                <span className={cn("numeric text-sm", month.minutes > 0 ? "text-primary" : "text-muted-foreground")}>
                  {month.minutes > 0 ? `${formatHours(month.minutes)} played` : "No hours logged"}
                </span>
              </header>
              <ol>
                {month.entries.map((entry) => (
                  <TimelineItem key={entry.key} entry={entry} />
                ))}
              </ol>
            </section>
          ))}
          <p className="hud-label text-center tracking-normal normal-case">
            Hours land on the day you logged them. Amounts are shown in the currency you paid.
          </p>
        </div>
      )}
    </section>
  );
}

function Legend({ className, children }: { className: string; children: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-2 rotate-45", className)} /> {children}
    </span>
  );
}
