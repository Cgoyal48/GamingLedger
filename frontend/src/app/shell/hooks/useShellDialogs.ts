import { useMemo, useState } from "react";
import type { Copy } from "@/api/games/types";
import type { Purchase } from "@/api/purchases/types";
import type { ShellActions } from "@app/shared/hooks/useShellActions";

type GameDialogState = { open: boolean; copy: Copy | null };
type PurchaseDialogState = { open: boolean; copyId: number | null; editing: Purchase | null };

/** The add/edit dialogs live once in the shell; any page opens them through the returned actions. */
export function useShellDialogs() {
  const [game, setGame] = useState<GameDialogState>({ open: false, copy: null });
  const [purchase, setPurchase] = useState<PurchaseDialogState>({ open: false, copyId: null, editing: null });

  const actions = useMemo<ShellActions>(
    () => ({
      addGame: () => setGame({ open: true, copy: null }),
      editGame: (copy) => setGame({ open: true, copy }),
      logPurchase: (copyId) => setPurchase({ open: true, copyId: copyId ?? null, editing: null }),
      editPurchase: (editing) => setPurchase({ open: true, copyId: editing.copy_id, editing }),
    }),
    [],
  );

  // Closing keeps the rest of the state, so the dialog doesn't change content while it animates out.
  const setGameOpen = (open: boolean) => setGame((current) => ({ ...current, open }));
  const setPurchaseOpen = (open: boolean) => setPurchase((current) => ({ ...current, open }));

  return { game, purchase, actions, setGameOpen, setPurchaseOpen, anyOpen: game.open || purchase.open };
}
