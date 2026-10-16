import { createContext, useContext } from "react";
import type { Copy } from "@/api/games/types";
import type { Purchase } from "@/api/purchases/types";

export type ShellActions = {
  addGame: () => void;
  editGame: (copy: Copy) => void;
  logPurchase: (copyId?: number) => void;
  editPurchase: (purchase: Purchase) => void;
};

export const ShellActionsContext = createContext<ShellActions | null>(null);

export function useShellActions() {
  const actions = useContext(ShellActionsContext);
  if (!actions) {
    throw new Error("useShellActions must be used inside LoggedInAppShell");
  }
  return actions;
}
