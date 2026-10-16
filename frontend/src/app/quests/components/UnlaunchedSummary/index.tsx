import { formatApprox } from "@app/shared/utils/money";
import { useStats } from "@/api/stats/hooks";

/** Money on games bought to play and never opened. Hidden until there is some. */
export function UnlaunchedSummary() {
  const stats = useStats();
  const unlaunched = stats.data?.unlaunched;
  if (!stats.data || !unlaunched || unlaunched.games === 0) {
    return null;
  }

  return (
    <div className="panel mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4">
      <span className="numeric text-3xl font-semibold text-amber">
        {formatApprox(unlaunched.spent_minor, stats.data.currency, unlaunched.converted)}
      </span>
      <p className="text-sm text-muted-foreground">
        waiting to be put to work across {unlaunched.games} {unlaunched.games === 1 ? "game" : "games"} you bought to
        play and haven’t opened. Games marked “To own” aren’t counted.
      </p>
    </div>
  );
}
