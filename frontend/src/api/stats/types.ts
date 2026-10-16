export type StatGroup = {
  /** A platform, or a year such as "2026". */
  key: string;
  games: number;
  /** Paid games with hours: the only ones behind cost_per_hour_minor. */
  paid_games: number;
  minutes: number;
  cost_per_hour_minor: number | null;
  converted: boolean;
  best: { copy_id: number; title: string; cost_per_hour_minor: number; converted: boolean } | null;
};

/** Spend on games bought to play and never opened. Games marked to_own are left out. */
export type Unlaunched = {
  /** Only the never-opened games that have spend. */
  games: number;
  spent_minor: number;
  converted: boolean;
};

export type Stats = {
  currency: string;
  platforms: StatGroup[];
  years: StatGroup[];
  unlaunched: Unlaunched;
};
