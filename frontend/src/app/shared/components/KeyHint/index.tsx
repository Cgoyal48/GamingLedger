import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The keyboard shortcut for a control. `onPrimary` restyles it for a filled primary button. */
export function KeyHint({
  children,
  onPrimary = false,
  className,
}: {
  children: ReactNode;
  onPrimary?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "key-hint",
        onPrimary && "border-primary-foreground/30 bg-transparent text-primary-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
