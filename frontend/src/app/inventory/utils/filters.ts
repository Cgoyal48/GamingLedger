import {
  acquisitions,
  intents,
  platforms,
  statuses,
  type Acquisition,
  type Copy,
  type Intent,
  type Platform,
  type Status,
} from "@/api/games/types";

const sorts = ["recent", "value", "title"] as const;
export type Sort = (typeof sorts)[number];

export const filterKeys = ["platform", "status", "acquisition", "intent"] as const;
export type FilterKey = (typeof filterKeys)[number];

export type Filters = {
  query: string;
  sort: Sort;
  platform: Platform | null;
  status: Status | null;
  acquisition: Acquisition | null;
  intent: Intent | null;
};

const sorters: Record<Sort, (a: Copy, b: Copy) => number> = {
  recent: (a, b) => b.created_at.localeCompare(a.created_at),
  value: (a, b) => (a.cost_per_hour_minor ?? Infinity) - (b.cost_per_hour_minor ?? Infinity),
  title: (a, b) => a.title.localeCompare(b.title),
};

function oneOf<T extends string>(value: string | null, allowed: readonly T[]): T | null {
  return allowed.includes(value as T) ? (value as T) : null;
}

/** Filters from the page URL. Anything unrecognised is ignored rather than breaking the page. */
export function readFilters(params: URLSearchParams): Filters {
  return {
    query: params.get("q") ?? "",
    sort: oneOf(params.get("sort"), sorts) ?? "recent",
    platform: oneOf(params.get("platform"), platforms),
    status: oneOf(params.get("status"), statuses),
    acquisition: oneOf(params.get("acquisition"), acquisitions),
    intent: oneOf(params.get("intent"), intents),
  };
}

export function activeFilterCount(filters: Filters) {
  return filterKeys.filter((key) => filters[key] != null).length + (filters.query.trim() ? 1 : 0);
}

export function applyFilters(copies: Copy[], filters: Filters) {
  const query = filters.query.trim().toLowerCase();
  return copies
    .filter(
      (copy) =>
        (!query || copy.title.toLowerCase().includes(query)) &&
        filterKeys.every((key) => filters[key] == null || copy[key] === filters[key]),
    )
    .sort(sorters[filters.sort]);
}
