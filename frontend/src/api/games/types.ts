export const platforms = ["steam", "playstation", "xbox", "switch", "mobile", "pc", "other"] as const;
export const statuses = ["unplayed", "playing", "completed", "abandoned"] as const;
export const intents = ["to_play", "to_own"] as const;
export const acquisitions = ["purchased", "free", "gift", "subscription"] as const;

export type Platform = (typeof platforms)[number];
export type Status = (typeof statuses)[number];
export type Intent = (typeof intents)[number];
export type Acquisition = (typeof acquisitions)[number];

export type CopyDetails = {
  platform: Platform;
  status: Status;
  intent: Intent;
  acquisition: Acquisition;
};

export type Copy = CopyDetails & {
  id: number;
  game_id: number;
  title: string;
  created_at: string;
  igdb_id: number | null;
  source: "custom" | "igdb";
  cover_url: string | null;
  spent_minor: number | null;
  /** The part of spent_minor that went on DLC, passes and other in-game purchases. */
  in_game_minor: number | null;
  spent_currency: string | null;
  converted: boolean;
  rate_missing: boolean;
  minutes: number | null;
  cost_per_hour_minor: number | null;
};

/** One hours entry. Negative minutes_added means the player corrected their hours down. */
export type PlaySession = {
  copy_id: number;
  recorded_at: string;
  minutes_added: number;
  total_minutes: number;
};

/** A typed title links a custom game; an igdb_id links that IGDB game. */
export type CopyRequest = CopyDetails & { title: string; igdb_id: number | null };

export type NewPurchase = { amount_minor: number; currency: string; purchased_at: string };

/** A purchased game must come with its price; any other acquisition must not. */
export type NewCopyRequest = { copy: CopyRequest; purchase: NewPurchase | null };
