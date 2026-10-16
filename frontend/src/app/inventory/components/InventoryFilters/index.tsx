import { SearchIcon, XIcon } from "lucide-react";
import type { FilterKey, Filters } from "@app/inventory/utils/filters";
import { OptionSelect } from "@app/shared/components/OptionSelect";
import { labels } from "@app/shared/constants/labels";
import { swatches } from "@app/shared/constants/swatches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { acquisitions, intents, platforms, statuses, type Copy } from "@/api/games/types";

const ALL = "all";

const selects: { key: FilterKey; values: readonly string[]; all: string }[] = [
  { key: "platform", values: platforms, all: "All platforms" },
  { key: "status", values: statuses, all: "Any status" },
  { key: "acquisition", values: acquisitions, all: "Any source" },
  { key: "intent", values: intents, all: "Play or own" },
];

/** Only values the library actually has, with how many games each, plus whatever is selected right now. */
function choices(copies: Copy[], key: FilterKey, values: readonly string[], all: string, current: string | null) {
  const counts = new Map<string, number>();
  for (const copy of copies) {
    counts.set(copy[key], (counts.get(copy[key]) ?? 0) + 1);
  }
  return [
    { value: ALL, label: all },
    ...values
      .filter((value) => counts.has(value) || value === current)
      .map((value) => ({ value, label: `${labels[value]} (${counts.get(value) ?? 0})`, swatch: swatches[value] })),
  ];
}

export function InventoryFilters({
  copies,
  filters,
  shown,
  active,
  onChange,
  onClear,
}: {
  copies: Copy[];
  filters: Filters;
  shown: number;
  active: number;
  onChange: (param: FilterKey | "q", value: string | null) => void;
  onClear: () => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search games"
          placeholder="Search games"
          value={filters.query}
          onChange={(event) => onChange("q", event.target.value)}
          className="h-9 rounded-sm bg-panel-raised/60 pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
        />
        {filters.query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange("q", null)}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        ) : null}
      </div>

      {selects.map(({ key, values, all }) => (
        <OptionSelect
          key={key}
          id={`filter-${key}`}
          label={all}
          hideLabel
          value={filters[key] ?? ALL}
          items={choices(copies, key, values, all, filters[key])}
          onChange={(value) => onChange(key, value === ALL ? null : value)}
          className="w-[calc(50%-0.25rem)] sm:w-44"
        />
      ))}

      {active > 0 ? (
        <div className="ml-auto flex items-center gap-2">
          <span className="hud-label">
            {shown} of {copies.length}
          </span>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <XIcon /> Clear
          </Button>
        </div>
      ) : null}
    </div>
  );
}
