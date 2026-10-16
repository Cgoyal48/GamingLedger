import { motion } from "motion/react";
import type { Rarity } from "@app/shared/utils/value";
import { cn } from "@/lib/utils";

const SEGMENTS = 12;

const rarityFill: Record<Rarity, string> = {
  legendary: "bg-rarity-legendary shadow-[0_0_8px_var(--rarity-legendary)]",
  epic: "bg-rarity-epic shadow-[0_0_6px_var(--rarity-epic)]",
  rare: "bg-rarity-rare",
  common: "bg-rarity-common",
};

/** Segmented like a health bar. Fills from the left as a game becomes better value. */
export function ValueBar({ fill, rarity, label }: { fill: number; rarity: Rarity; label: string }) {
  const lit = Math.max(1, Math.round(fill * SEGMENTS));
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fill * 100)}
      className="flex gap-[3px]"
    >
      {Array.from({ length: SEGMENTS }, (_, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, scaleY: 0.3 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: index * 0.025, duration: 0.18 }}
          className={cn("h-2.5 flex-1 -skew-x-12", index < lit ? rarityFill[rarity] : "bg-foreground/8")}
        />
      ))}
    </div>
  );
}

export function LockedValueBar() {
  return (
    <div aria-hidden className="flex gap-[3px]">
      {Array.from({ length: SEGMENTS }, (_, index) => (
        <span key={index} className="h-2.5 flex-1 -skew-x-12 border border-dashed border-foreground/15" />
      ))}
    </div>
  );
}
