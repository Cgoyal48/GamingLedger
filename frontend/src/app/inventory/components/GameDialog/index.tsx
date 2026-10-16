import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Copy } from "@/api/games/types";
import { GameForm } from "./GameForm";

/** Adds a game, or edits `copy` when one is given. */
export function GameDialog({
  open,
  copy,
  onOpenChange,
}: {
  open: boolean;
  copy: Copy | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="panel gap-5 rounded-none p-6 ring-0 sm:max-w-xl">
        <DialogHeader>
          <p className="hud-label text-primary">{copy ? "Edit game" : "New game"}</p>
          <DialogTitle className="text-2xl font-semibold">{copy ? copy.title : "Add to inventory"}</DialogTitle>
          <DialogDescription>
            {copy
              ? "Fix the title or platform. Pick an IGDB match to link its cover art."
              : "Search IGDB or type any title. Enter saves it."}
          </DialogDescription>
        </DialogHeader>
        {open ? <GameForm key={copy?.id ?? "new"} copy={copy} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}
