import { LockIcon } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";

/** A value the form decides on its own, shown where its select would be, with the reason underneath. */
export function LockedField({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Field>
      <FieldLabel className="hud-label">{label}</FieldLabel>
      <p className="flex h-9 items-center justify-between gap-2 border border-dashed border-border bg-background/30 px-3 text-sm">
        <span>{value}</span>
        <LockIcon aria-hidden className="size-3.5 text-muted-foreground" />
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Field>
  );
}
