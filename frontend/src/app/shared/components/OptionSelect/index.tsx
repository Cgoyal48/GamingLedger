import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Item<T extends string> = { value: T; label: string; swatch?: string };

function Swatch({ className }: { className?: string }) {
  return <span aria-hidden className={cn("size-2 shrink-0 rotate-45 rounded-[1px]", className)} />;
}

export function OptionSelect<T extends string>({
  id,
  label,
  value,
  items,
  onChange,
  disabled,
  className,
  hideLabel,
}: {
  id: string;
  label: string;
  value: T | "";
  items: Item<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  hideLabel?: boolean;
}) {
  const selected = items.find((item) => item.value === value);

  return (
    <Field className={cn("gap-1.5", className)}>
      <FieldLabel htmlFor={id} className={cn("hud-label", hideLabel && "sr-only")}>
        {label}
      </FieldLabel>
      <Select
        items={items}
        value={value === "" ? null : value}
        onValueChange={(next) => {
          if (next != null) onChange(next as T);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          aria-label={label}
          className={cn(
            "h-9 w-full rounded-sm border-input bg-panel-raised/60 pl-3 font-medium transition-[border-color,background-color,box-shadow]",
            "hover:border-primary/40 hover:bg-panel-raised dark:bg-panel-raised/60 dark:hover:bg-panel-raised",
            "data-popup-open:border-primary/70 data-popup-open:bg-panel-raised data-popup-open:ring-3 data-popup-open:ring-ring/20",
            "[&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 data-popup-open:[&>svg:last-child]:rotate-180 data-popup-open:[&>svg:last-child]:text-primary",
          )}
        >
          {selected?.swatch ? <Swatch className={selected.swatch} /> : null}
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          sideOffset={6}
          className="max-h-72 min-w-(--anchor-width) rounded-sm border-t-2 border-primary/70 bg-popover p-1 shadow-xl ring-1 shadow-black/50 ring-white/10"
        >
          {items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className={cn(
                "relative rounded-[2px] py-2 pr-8 pl-3 text-sm text-muted-foreground transition-colors",
                "before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity",
                "data-highlighted:bg-primary/10 data-highlighted:text-foreground data-highlighted:before:opacity-100",
                "focus:bg-primary/10 focus:text-foreground",
                "data-selected:font-semibold data-selected:text-primary [&_svg]:text-primary",
              )}
            >
              {item.swatch ? <Swatch className={item.swatch} /> : null}
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
