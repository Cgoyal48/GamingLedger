import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A failed save or delete, announced to screen readers. */
export function ErrorNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-sm text-destructive", className)} role="alert">
      {children}
    </p>
  );
}
