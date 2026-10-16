import { useCopies } from "@/api/games/hooks";
import { cn } from "@/lib/utils";
import { formatHours } from "@app/shared/utils/hours";
import { overall } from "@app/shared/utils/value";

export function LibraryTotals() {
  const copies = useCopies();
  const totals = overall(copies.data ?? []);

  return (
    <dl className="flex gap-6" aria-label="Library totals">
      <HudStat label="Cost / hr" value={totals.perHour ?? "—"} accent />
      <HudStat label="Played" value={formatHours(totals.totalMinutes)} />
      <HudStat label="Games" value={String(copies.data?.length ?? "—")} />
    </dl>
  );
}

function HudStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-right">
      <dt className="hud-label">{label}</dt>
      <dd className={cn("numeric text-lg leading-tight font-semibold", accent && "text-primary")}>{value}</dd>
    </div>
  );
}
