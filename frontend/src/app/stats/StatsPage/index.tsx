import { EmptyState } from "@app/shared/components/EmptyState";
import { LoadState } from "@app/shared/components/LoadState";
import { PageHeader } from "@app/shared/components/PageHeader";
import { StatSection } from "@app/stats/components/StatSection";
import { useStats } from "@/api/stats/hooks";

export function StatsPage() {
  const stats = useStats();

  return (
    <section>
      <PageHeader eyebrow="Stats" title="Where your hours are cheapest" />

      {stats.isPending ? (
        <LoadState />
      ) : stats.isError ? (
        <LoadState error retry={() => void stats.refetch()} />
      ) : stats.data.platforms.length === 0 ? (
        <EmptyState title="No stats yet">
          <p className="max-w-sm text-sm text-muted-foreground">
            Add games, log what they cost and how long you played, and cost per hour by platform and year shows up here.
          </p>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-10">
          <StatSection
            title="By platform"
            description="Total spend over total hours for each platform's paid games."
            groups={stats.data.platforms}
            currency={stats.data.currency}
            platform
          />
          {stats.data.years.length > 0 ? (
            <StatSection
              title="By year bought"
              description="Each game counts in the year you first paid for it."
              groups={stats.data.years}
              currency={stats.data.currency}
            />
          ) : null}
        </div>
      )}
    </section>
  );
}
