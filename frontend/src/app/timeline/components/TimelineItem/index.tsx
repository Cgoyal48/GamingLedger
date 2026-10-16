import { WalletIcon } from "lucide-react";
import { GameCover } from "@app/shared/components/GameCover";
import { formatDay } from "@app/shared/utils/dates";
import { formatHours, formatHoursChange } from "@app/shared/utils/hours";
import { labels } from "@app/shared/constants/labels";
import { formatMoney } from "@app/shared/utils/money";
import { notLaunched, type TimelineEntry } from "@app/timeline/utils/timeline";
import { cn } from "@/lib/utils";

const purchaseWhat = { game: "Bought", in_game: "In-game purchase", top_up: "Wallet top-up" } as const;

function describe(entry: TimelineEntry) {
  if (entry.type === "purchase") {
    const { purchase } = entry;
    return {
      what: purchaseWhat[purchase.kind],
      value: formatMoney(purchase.amount_minor, purchase.currency),
      tone: "text-amber",
      flag: notLaunched(purchase, entry.copy) ? "Not launched yet" : null,
      note: purchase.note,
    };
  }
  return {
    what: entry.minutes < 0 ? "Hours corrected" : "Played",
    value: formatHoursChange(entry.minutes),
    tone: entry.minutes < 0 ? "text-muted-foreground" : "text-primary",
    flag: null,
    note: null,
  };
}

/** One purchase or one day's hours for a game, on the timeline's rail. */
export function TimelineItem({ entry }: { entry: TimelineEntry }) {
  const isPurchase = entry.type === "purchase";
  const title = entry.copy?.title ?? (isPurchase && entry.purchase.copy_id == null ? labels.top_up : "Removed game");
  const { what, value, tone, flag, note } = describe(entry);
  const meta = [
    what,
    entry.copy ? labels[entry.copy.platform] : null,
    entry.type === "play" ? `${formatHours(entry.total)} total` : null,
    note,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="grid grid-cols-[3.5rem_1fr] gap-3">
      <span className="numeric pt-2.5 text-right text-xs text-muted-foreground">{formatDay(entry.at)}</span>
      <div className="relative border-l border-border py-1.5 pl-5">
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 -left-[4.5px] size-2 -translate-y-1/2 rotate-45",
            isPurchase ? "bg-amber" : "bg-primary",
          )}
        />
        <div className="flex items-center gap-3">
          {entry.copy ? (
            <GameCover url={entry.copy.cover_url} title={entry.copy.title} className="w-7" />
          ) : (
            <span className="flex aspect-[264/374] w-7 shrink-0 items-center justify-center border border-border text-muted-foreground">
              <WalletIcon className="size-3.5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate">{title}</p>
            <p className="truncate text-xs text-muted-foreground">{meta}</p>
          </div>
          {flag ? (
            <span className="hud-label shrink-0 border border-amber/40 px-1.5 py-0.5 whitespace-nowrap text-amber">
              {flag}
            </span>
          ) : null}
          <span className={cn("numeric text-right", tone)}>{value}</span>
        </div>
      </div>
    </li>
  );
}
