import { PlayIcon } from "lucide-react";
import { motion } from "motion/react";
import { PlatformSpine } from "@app/shared/components/PlatformSpine";
import { labels } from "@app/shared/constants/labels";
import { daysSince } from "@app/shared/utils/dates";
import { formatApprox } from "@app/shared/utils/money";
import { Button } from "@/components/ui/button";
import type { Copy } from "@/api/games/types";

function waiting(copy: Copy) {
  const days = daysSince(copy.created_at);
  return days <= 0 ? "Added today" : days === 1 ? "Waiting 1 day" : `Waiting ${days} days`;
}

/** A game waiting for its first session, with the two ways off the list. */
export function QuestItem({
  copy,
  position,
  busy,
  onCollect,
  onStart,
}: {
  copy: Copy;
  position: number;
  busy: boolean;
  onCollect: () => void;
  onStart: () => void;
}) {
  const meta = [
    labels[copy.platform],
    waiting(copy),
    copy.spent_minor != null && copy.spent_currency
      ? `${formatApprox(copy.spent_minor, copy.spent_currency, copy.converted)} ready to be put to work`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.2 }}
      className="panel flex items-stretch"
    >
      <PlatformSpine platform={copy.platform} />
      <div className="flex flex-1 flex-wrap items-center gap-4 px-4 py-3">
        <span className="numeric w-8 text-sm text-muted-foreground">{String(position).padStart(2, "0")}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{copy.title}</p>
          <p className="text-xs text-muted-foreground">{meta}</p>
        </div>
        <Button variant="ghost" size="sm" disabled={busy} onClick={onCollect}>
          Just collecting
        </Button>
        <Button size="sm" disabled={busy} onClick={onStart}>
          <PlayIcon /> Start quest
        </Button>
      </div>
    </motion.li>
  );
}
