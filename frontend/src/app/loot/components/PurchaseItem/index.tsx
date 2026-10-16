import { PencilIcon, Trash2Icon } from "lucide-react";
import { motion } from "motion/react";
import { formatDay } from "@app/shared/utils/dates";
import { formatMoney } from "@app/shared/utils/money";
import { Button } from "@/components/ui/button";
import type { Purchase } from "@/api/purchases/types";

/** One line of the loot log. `what` names the game and kind, e.g. "Hades · Game". */
export function PurchaseItem({
  purchase,
  what,
  busy,
  onEdit,
  onDelete,
}: {
  purchase: Purchase;
  what: string;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      className="group grid grid-cols-[4.5rem_1fr_auto_auto] items-center gap-3 py-1.5"
    >
      <span className="numeric text-xs text-muted-foreground">{formatDay(purchase.purchased_at)}</span>
      <span className="min-w-0">
        <span className="block truncate">{what}</span>
        {purchase.note ? <span className="block truncate text-xs text-muted-foreground">{purchase.note}</span> : null}
      </span>
      <span className="numeric text-right text-amber">{formatMoney(purchase.amount_minor, purchase.currency)}</span>
      <span className="flex opacity-60 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Button variant="ghost" size="icon-sm" aria-label={`Edit ${what} purchase`} onClick={onEdit}>
          <PencilIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${what} purchase`}
          disabled={busy}
          onClick={onDelete}
        >
          <Trash2Icon />
        </Button>
      </span>
    </motion.li>
  );
}
