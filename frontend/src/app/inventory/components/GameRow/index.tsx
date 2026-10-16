import { motion } from "motion/react";
import { GameActions } from "@app/inventory/components/GameActions";
import { GameTags } from "@app/inventory/components/GameTags";
import { HoursField } from "@app/inventory/components/HoursField";
import { LockedValueBar, ValueBar } from "@app/inventory/components/ValueBar";
import { GameCover } from "@app/shared/components/GameCover";
import { OptionSelect } from "@app/shared/components/OptionSelect";
import { PlatformSpine } from "@app/shared/components/PlatformSpine";
import { optionItems } from "@app/shared/utils/options";
import {
  costPerHourText,
  costSummary,
  RANKS_UNLOCK_AT,
  rarityLabels,
  rarityText,
  type Rarity,
} from "@app/shared/utils/value";
import { statuses, type Copy, type Status } from "@/api/games/types";
import { cn } from "@/lib/utils";

type GameRowProps = {
  copy: Copy;
  rank: { rarity: Rarity; fill: number } | undefined;
  ranksUnlocked: boolean;
  busy: boolean;
  onHours: (minutes: number) => void;
  onStatus: (status: Status) => void;
  onEdit: () => void;
  onLogPurchase: () => void;
  onRemove: () => void;
};

/** One game: a tall cover, with details stacked beside it and the playtime controls along the bottom. */
export function GameRow({
  copy,
  rank,
  ranksUnlocked,
  busy,
  onHours,
  onStatus,
  onEdit,
  onLogPurchase,
  onRemove,
}: GameRowProps) {
  const perHour = costPerHourText(copy);
  const cost = costSummary(copy);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      aria-label={copy.title}
      className="panel panel-interactive group flex"
    >
      <PlatformSpine platform={copy.platform} />
      <div className="flex min-w-0 flex-1 gap-4 p-3 sm:gap-5">
        <GameCover url={copy.cover_url} title={copy.title} className="w-28 self-start sm:w-32" />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0 pt-0.5">
              <h3 className="line-clamp-2 text-xl leading-tight font-semibold">{copy.title}</h3>
              <GameTags copy={copy} className="mt-2" />
            </div>
            <GameActions title={copy.title} onEdit={onEdit} onLogPurchase={onLogPurchase} onRemove={onRemove} />
          </header>

          <div className="grid flex-1 grid-cols-[minmax(0,1fr)_auto] gap-x-6">
            {/* Left: what the game cost, then the controls that change its value. */}
            <div className="flex min-w-0 flex-col gap-3">
              <dl className="flex flex-wrap gap-x-10 gap-y-3 py-1">
                <div className="min-w-0">
                  <dt className="hud-label">Cost</dt>
                  <dd className="numeric mt-1 truncate text-base font-medium">{cost.cost}</dd>
                </div>
                {cost.inGame ? (
                  <div className="min-w-0">
                    <dt className="hud-label">In-game</dt>
                    <dd className="numeric mt-1 truncate text-base font-medium">{cost.inGame}</dd>
                  </div>
                ) : null}
              </dl>
              <footer className="mt-auto flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-3">
                <HoursField id={`hours-${copy.id}`} minutes={copy.minutes} disabled={busy} onCommit={onHours} />
                <OptionSelect
                  id={`status-${copy.id}`}
                  label={`Status of ${copy.title}`}
                  hideLabel
                  value={copy.status}
                  items={optionItems(statuses)}
                  onChange={onStatus}
                  disabled={busy}
                  className="w-36"
                />
              </footer>
            </div>

            {/* Right: the value itself, and how it ranks. */}
            <div className="flex w-44 flex-col items-end gap-3 border-l border-dashed border-border py-1 pl-6 text-right sm:w-52">
              <dl>
                <dt className="hud-label">Per hour</dt>
                <dd
                  className={cn(
                    "numeric mt-1 text-3xl leading-none font-semibold",
                    perHour ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {perHour ?? "—"}
                </dd>
              </dl>
              {rank ? (
                <div className="flex w-full flex-col items-end gap-1.5">
                  <div className="w-full">
                    <ValueBar fill={rank.fill} rarity={rank.rarity} label={rarityLabels[rank.rarity]} />
                  </div>
                  <span className={cn("hud-label whitespace-nowrap", rarityText[rank.rarity])}>
                    {rarityLabels[rank.rarity]}
                  </span>
                </div>
              ) : perHour && !ranksUnlocked ? (
                <div className="w-full" title={`Value rank unlocks at ${RANKS_UNLOCK_AT} paid games with hours`}>
                  <LockedValueBar />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
