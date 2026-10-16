import { formatApprox } from "@app/shared/utils/money";
import { labels } from "@app/shared/constants/labels";
import type { Copy } from "@/api/games/types";

export type Rarity = "legendary" | "epic" | "rare" | "common";

export const RANKS_UNLOCK_AT = 3;

export const rarityLabels: Record<Rarity, string> = {
  legendary: "Legendary value",
  epic: "Epic value",
  rare: "Rare value",
  common: "Common value",
};

export const rarityText: Record<Rarity, string> = {
  legendary: "text-rarity-legendary",
  epic: "text-rarity-epic",
  rare: "text-rarity-rare",
  common: "text-rarity-common",
};

export function isNeverLaunched(copy: Copy) {
  return copy.intent === "to_play" && copy.status === "unplayed" && !copy.minutes;
}

/**
 * Ranks paid, played games against each other by cost per hour, cheapest first.
 * Relative to the player's own library, so no currency thresholds are needed.
 * `fill` is 0..1 for the value bar: 1 is the best value in the library.
 */
export function rankByValue(copies: Copy[]) {
  const ranked = copies
    .filter((copy) => copy.cost_per_hour_minor != null)
    .sort((a, b) => a.cost_per_hour_minor! - b.cost_per_hour_minor!);
  const result = new Map<number, { rarity: Rarity; fill: number }>();
  if (ranked.length < RANKS_UNLOCK_AT) {
    return { unlocked: false, ranks: result };
  }
  ranked.forEach((copy, index) => {
    const position = index / (ranked.length - 1);
    const rarity: Rarity =
      position <= 0.15 ? "legendary" : position <= 0.4 ? "epic" : position <= 0.7 ? "rare" : "common";
    result.set(copy.id, { rarity, fill: Math.max(0.08, 1 - position) });
  });
  return { unlocked: true, ranks: result };
}

/** What a game cost. `inGame` is the extra spent after buying, only once there is some. */
export function costSummary(copy: Copy): { cost: string; inGame: string | null } {
  if (copy.rate_missing) {
    return { cost: "Rate unavailable", inGame: null };
  }
  const noCost =
    copy.acquisition === "subscription"
      ? "No direct cost"
      : copy.acquisition === "purchased"
        ? "—"
        : labels[copy.acquisition];
  if (copy.spent_minor == null || copy.spent_currency == null) {
    return { cost: noCost, inGame: null };
  }
  const currency = copy.spent_currency;
  const money = (amountMinor: number) => formatApprox(amountMinor, currency, copy.converted);
  const inGame = copy.in_game_minor ?? 0;
  const game = copy.spent_minor - inGame;
  return { cost: game > 0 ? money(game) : noCost, inGame: inGame > 0 ? money(inGame) : null };
}

export function costPerHourText(copy: Copy) {
  if (copy.cost_per_hour_minor == null || copy.spent_currency == null) {
    return null;
  }
  return formatApprox(copy.cost_per_hour_minor, copy.spent_currency, copy.converted);
}

export function overall(copies: Copy[]) {
  const paid = copies.filter((copy) => copy.spent_minor != null && copy.spent_currency != null && copy.minutes);
  const totalMinutes = copies.reduce((total, copy) => total + (copy.minutes ?? 0), 0);
  if (paid.length === 0) {
    return { perHour: null, totalMinutes, paidGames: 0 };
  }
  const currency = paid[0].spent_currency!;
  const spent = paid.reduce((total, copy) => total + copy.spent_minor!, 0);
  const minutes = paid.reduce((total, copy) => total + copy.minutes!, 0);
  return {
    perHour: formatApprox(
      Math.round((spent * 60) / minutes),
      currency,
      paid.some((copy) => copy.converted),
    ),
    totalMinutes,
    paidGames: paid.length,
  };
}
