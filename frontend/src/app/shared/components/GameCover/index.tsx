import { useState } from "react";
import { cn } from "@/lib/utils";

/** IGDB box art at its 264×374 ratio. Custom games, or art that fails to load, get a lettered placeholder. */
export function GameCover({ url, title, className }: { url: string | null; title: string; className?: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = url != null && url !== failedUrl;

  return (
    <div
      className={cn(
        "@container relative aspect-[264/374] shrink-0 overflow-hidden border border-border bg-muted/40",
        className,
      )}
    >
      {showImage ? (
        <img src={url} alt="" loading="lazy" onError={() => setFailedUrl(url)} className="size-full object-cover" />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center font-mono text-[40cqw] font-semibold text-muted-foreground uppercase"
        >
          {title.trim().charAt(0) || "?"}
        </span>
      )}
    </div>
  );
}
