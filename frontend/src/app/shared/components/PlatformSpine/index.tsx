import type { Platform } from "@/api/games/types";
import { cn } from "@/lib/utils";

const spineColor: Record<Platform, string> = {
  steam: "bg-platform-steam",
  playstation: "bg-platform-playstation",
  xbox: "bg-platform-xbox",
  switch: "bg-platform-switch",
  mobile: "bg-platform-mobile",
  pc: "bg-platform-pc",
  other: "bg-platform-other",
};

const spineText: Record<Platform, string> = {
  steam: "STEAM",
  playstation: "PS",
  xbox: "XBOX",
  switch: "SWITCH",
  mobile: "MOBILE",
  pc: "PC",
  other: "OTHER",
};

/** The coloured edge of a cartridge, labelled vertically like a box spine. */
export function PlatformSpine({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <div aria-hidden className={cn("flex w-7 shrink-0 items-center justify-center", spineColor[platform], className)}>
      <span className="rotate-180 font-mono text-[0.62rem] font-bold tracking-[0.3em] text-black/75 [writing-mode:vertical-rl]">
        {spineText[platform]}
      </span>
    </div>
  );
}
