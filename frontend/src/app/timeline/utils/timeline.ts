import type { Copy, PlaySession } from "@/api/games/types";
import type { Purchase } from "@/api/purchases/types";
import { formatMonth, localDate } from "@app/shared/utils/dates";

export type TimelineEntry =
  | { type: "purchase"; key: string; at: string; purchase: Purchase; copy: Copy | undefined }
  | { type: "play"; key: string; at: string; copy: Copy | undefined; minutes: number; total: number };

export type TimelineMonth = { key: string; label: string; minutes: number; entries: TimelineEntry[] };

/** A game bought to play that still has no hours: the pattern the timeline exists to surface. */
export function notLaunched(purchase: Purchase, copy: Copy | undefined) {
  return purchase.kind === "game" && copy != null && copy.intent === "to_play" && !copy.minutes;
}

/**
 * Purchases and hours on one list, newest first, grouped by month.
 * Several hours entries for one game on one day become a single entry.
 */
export function buildTimeline(purchases: Purchase[], sessions: PlaySession[], copies: Copy[]): TimelineMonth[] {
  const byId = new Map(copies.map((copy) => [copy.id, copy]));
  const entries: TimelineEntry[] = purchases.map((purchase) => ({
    type: "purchase",
    key: `purchase-${purchase.id}`,
    at: purchase.purchased_at,
    purchase,
    copy: purchase.copy_id == null ? undefined : byId.get(purchase.copy_id),
  }));

  // Sessions arrive newest first, so the first one seen for a day carries that day's time and final total.
  const days = new Map<string, Extract<TimelineEntry, { type: "play" }>>();
  for (const session of sessions) {
    const key = `play-${session.copy_id}-${localDate(session.recorded_at)}`;
    const day = days.get(key);
    if (day) {
      day.minutes += session.minutes_added;
    } else {
      days.set(key, {
        type: "play",
        key,
        at: session.recorded_at,
        copy: byId.get(session.copy_id),
        minutes: session.minutes_added,
        total: session.total_minutes,
      });
    }
  }
  entries.push(...[...days.values()].filter((day) => day.minutes !== 0));
  entries.sort((a, b) => b.at.localeCompare(a.at));

  const months = new Map<string, TimelineMonth>();
  for (const entry of entries) {
    const key = localDate(entry.at).slice(0, 7);
    let month = months.get(key);
    if (!month) {
      month = { key, label: formatMonth(entry.at), minutes: 0, entries: [] };
      months.set(key, month);
    }
    month.entries.push(entry);
    if (entry.type === "play") {
      month.minutes += entry.minutes;
    }
  }
  return [...months.values()];
}
