export const purchaseKinds = ["game", "in_game", "top_up"] as const;
export type PurchaseKind = (typeof purchaseKinds)[number];

export type Purchase = {
  id: number;
  copy_id: number | null;
  kind: PurchaseKind;
  amount_minor: number;
  currency: string;
  purchased_at: string;
  note: string | null;
};

export type PurchaseRequest = Omit<Purchase, "id">;
