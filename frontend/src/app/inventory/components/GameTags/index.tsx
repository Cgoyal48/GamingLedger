import type { Copy } from "@/api/games/types";
import { labels } from "@app/shared/constants/labels";
import { cn } from "@/lib/utils";

export function GameTags({ copy, className }: { copy: Copy; className?: string }) {
  const tags = [
    labels[copy.platform],
    labels[copy.acquisition],
    copy.intent === "to_own" ? labels.to_own : null,
  ].filter((tag): tag is string => tag != null);
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Details">
      {tags.map((tag) => (
        <li
          key={tag}
          className="border border-border bg-background/40 px-1.5 py-0.5 text-[11px] leading-none text-muted-foreground"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
