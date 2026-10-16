import { formatMonth } from "@app/shared/utils/dates";
import type { Purchase } from "@/api/purchases/types";

/** Purchases arrive newest first, so months come out newest first too. */
export function groupByMonth(purchases: Purchase[]) {
  const months = new Map<string, Purchase[]>();
  for (const purchase of purchases) {
    const month = formatMonth(purchase.purchased_at);
    months.set(month, [...(months.get(month) ?? []), purchase]);
  }
  return months;
}
