import { StatCard } from "@app/stats/components/StatCard";
import { cheapestRate } from "@app/stats/utils/compare";
import type { Platform } from "@/api/games/types";
import type { StatGroup } from "@/api/stats/types";

export function StatSection({
  title,
  description,
  groups,
  currency,
  platform = false,
}: {
  title: string;
  description: string;
  groups: StatGroup[];
  currency: string;
  /** Groups are keyed by platform, so cards get the platform's name and colour. */
  platform?: boolean;
}) {
  const cheapest = cheapestRate(groups);

  return (
    <section aria-label={title}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="hud-label text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <StatCard
            key={group.key}
            group={group}
            currency={currency}
            cheapest={cheapest}
            platform={platform ? (group.key as Platform) : null}
          />
        ))}
      </div>
    </section>
  );
}
