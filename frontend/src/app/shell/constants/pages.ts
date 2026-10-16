/** The signed-in pages, in tab order. `key` is the number that jumps to the page. */
export const pages = [
  { to: "/inventory", label: "Inventory", key: "1" },
  { to: "/quests", label: "Quests", key: "2" },
  { to: "/loot", label: "Loot log", key: "3" },
  { to: "/timeline", label: "Timeline", key: "4" },
  { to: "/stats", label: "Stats", key: "5" },
  { to: "/options", label: "Options", key: "6" },
] as const;
