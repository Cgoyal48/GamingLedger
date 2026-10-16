import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Purchase } from "@/api/purchases/types";
import { PurchaseForm } from "./PurchaseForm";

/** Logs a purchase, or edits `editing` when one is given. */
export function LogPurchaseDialog({
  open,
  copyId,
  editing,
  onOpenChange,
}: {
  open: boolean;
  copyId: number | null;
  editing: Purchase | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="panel gap-5 rounded-none p-6 ring-0 sm:max-w-lg">
        <DialogHeader>
          <p className="hud-label text-amber">Loot</p>
          <DialogTitle className="text-2xl font-semibold">{editing ? "Edit purchase" : "Log a purchase"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Change anything that was logged wrong."
              : "Only the amount is needed. Today is the default date."}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <PurchaseForm
            key={editing?.id ?? "new"}
            copyId={copyId}
            editing={editing}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
