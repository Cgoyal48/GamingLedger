import type { StatGroup } from "@/api/stats/types";

/** With one paid game a group's figure is just that game's, so it isn't compared against other groups. */
const COMPARE_FROM = 2;

export function isComparable(group: StatGroup) {
  return group.cost_per_hour_minor != null && group.paid_games >= COMPARE_FROM;
}

/** The lowest cost per hour among comparable groups: the full bar everything else is measured against. */
export function cheapestRate(groups: StatGroup[]) {
  const rates = groups.filter(isComparable).map((group) => group.cost_per_hour_minor!);
  return rates.length > 0 ? Math.min(...rates) : null;
}
