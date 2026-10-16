import { PlatformSpine } from "@app/shared/components/PlatformSpine";
import { formatHours } from "@app/shared/utils/hours";
import { labels } from "@app/shared/constants/labels";
import { formatApprox } from "@app/shared/utils/money";
import { isComparable } from "@app/stats/utils/compare";
import type { Platform } from "@/api/games/types";
import type { StatGroup } from "@/api/stats/types";
import { cn } from "@/lib/utils";

/** One platform or year: its cost per hour, and a bar against the cheapest comparable group. */
export function StatCard({
  group,
  currency,
  cheapest,
  platform,
}: {
  group: StatGroup;
  currency: string;
  cheapest: number | null;
  platform: Platform | null;
}) {
  const label = platform ? labels[platform] : group.key;
  const rate = group.cost_per_hour_minor;
  const comparable = isComparable(group);
  const fill = comparable && cheapest != null ? cheapest / rate! : 0;
  const counts = `${group.games} ${group.games === 1 ? "game" : "games"} · ${formatHours(group.minutes)} played`;

  return (
    <article aria-label={label} className="panel flex min-h-44">
      {platform ? <PlatformSpine platform={platform} /> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <header>
          <h3 className="truncate text-lg leading-tight font-semibold">{label}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{counts}</p>
        </header>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "numeric text-2xl font-semibold",
                comparable ? "text-primary" : rate != null ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {rate != null ? formatApprox(rate, currency, group.converted) : "—"}
            </span>
            <span className="hud-label">per hour</span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {comparable
              ? `Across ${group.paid_games} paid games with hours`
              : rate != null
                ? `From 1 paid game: ${group.best!.title}`
                : "No paid games with hours yet"}
          </p>
        </div>

        {comparable ? (
          <div
            role="meter"
            aria-label={`${label} value compared with your cheapest group`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(fill * 100)}
            className="h-1.5 bg-muted"
          >
            <div className="h-full bg-primary" style={{ width: `${Math.max(6, fill * 100)}%` }} />
          </div>
        ) : null}

        {group.best && comparable ? (
          <p className="mt-auto truncate text-xs text-muted-foreground">
            Best value: <span className="text-foreground">{group.best.title}</span> at{" "}
            <span className="numeric">
              {formatApprox(group.best.cost_per_hour_minor, currency, group.best.converted)}
            </span>
            /h
          </p>
        ) : null}
      </div>
    </article>
  );
}
