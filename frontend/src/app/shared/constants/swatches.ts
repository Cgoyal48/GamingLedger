/** Colour chips shown beside platform and status options. Full class names so Tailwind can see them. */
export const swatches: Record<string, string> = {
  steam: "bg-platform-steam",
  playstation: "bg-platform-playstation",
  xbox: "bg-platform-xbox",
  switch: "bg-platform-switch",
  mobile: "bg-platform-mobile",
  pc: "bg-platform-pc",
  other: "bg-platform-other",
  unplayed: "bg-muted-foreground/60",
  playing: "bg-primary",
  completed: "bg-rarity-legendary",
  abandoned: "bg-destructive",
};
