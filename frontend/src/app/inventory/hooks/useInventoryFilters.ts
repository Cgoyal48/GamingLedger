import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { activeFilterCount, filterKeys, readFilters, type FilterKey } from "@app/inventory/utils/filters";

type Param = FilterKey | "q" | "sort";

/** Inventory filters kept in the URL, so they survive a refresh. Updates replace history rather than adding to it. */
export function useInventoryFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);

  function update(change: (next: URLSearchParams) => void) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        change(next);
        return next;
      },
      { replace: true },
    );
  }

  function set(param: Param, value: string | null) {
    update((next) => (value ? next.set(param, value) : next.delete(param)));
  }

  function clear() {
    update((next) => [...filterKeys, "q"].forEach((param) => next.delete(param)));
  }

  return { filters, active: activeFilterCount(filters), set, clear };
}
