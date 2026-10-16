import { toast } from "sonner";
import { ErrorNote } from "@app/shared/components/ErrorNote";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePurchases } from "@/api/purchases/hooks";
import { useDeleteCopy } from "@/api/games/hooks";
import type { Copy } from "@/api/games/types";

export function RemoveGameDialog({ copy, onClose }: { copy: Copy | null; onClose: () => void }) {
  const remove = useDeleteCopy();
  const purchases = usePurchases();
  const purchaseCount = copy ? (purchases.data ?? []).filter((purchase) => purchase.copy_id === copy.id).length : 0;

  return (
    <Dialog open={copy != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="panel gap-4 rounded-none p-6 ring-0 sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <p className="hud-label text-destructive">Remove</p>
          <DialogTitle className="text-xl font-semibold">Remove {copy?.title}?</DialogTitle>
          <DialogDescription>
            {purchaseCount > 0
              ? `This also deletes its hours and ${purchaseCount} logged ${purchaseCount === 1 ? "purchase" : "purchases"}. This cannot be undone.`
              : "This also deletes its logged hours. This cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        {remove.isError ? <ErrorNote>Could not remove it. Try again.</ErrorNote> : null}
        <DialogFooter className="-mx-6 -mb-6 bg-transparent">
          <Button variant="ghost" onClick={onClose}>
            Keep it
          </Button>
          <Button
            variant="destructive"
            disabled={remove.isPending || !copy}
            onClick={() =>
              copy &&
              remove.mutate(copy.id, {
                onSuccess: () => {
                  toast(`${copy.title} removed`);
                  onClose();
                },
              })
            }
          >
            {remove.isPending ? "Removing…" : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
