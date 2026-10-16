import { Input } from "@/components/ui/input";
import { minutesToHoursInput } from "@app/shared/utils/hours";

/** Saves on blur or Enter, and only when the rounded minutes actually changed. */
export function HoursField({
  id,
  minutes,
  disabled,
  onCommit,
}: {
  id: string;
  minutes: number | null;
  disabled?: boolean;
  onCommit: (minutes: number) => void;
}) {
  function commit(text: string) {
    const trimmed = text.trim();
    if (trimmed === "") {
      return;
    }
    const hours = Number(trimmed);
    if (!Number.isFinite(hours) || hours < 0) {
      return;
    }
    const next = Math.round(hours * 60);
    if (next !== minutes) {
      onCommit(next);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={id} className="hud-label">
        Hours
      </label>
      <Input
        key={minutes ?? "none"}
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step={0.5}
        placeholder="0"
        defaultValue={minutesToHoursInput(minutes)}
        disabled={disabled}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="numeric h-8 w-20 bg-background/50 text-right"
      />
    </div>
  );
}
