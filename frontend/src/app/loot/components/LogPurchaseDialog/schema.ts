import { z } from "zod";
import { localDate, today } from "@app/shared/utils/dates";
import { minorToInput, toMinor } from "@app/shared/utils/money";
import type { Purchase } from "@/api/purchases/types";
import { currencies, type Currency } from "@/api/settings/types";

/** The "For" select's value for a purchase that isn't for any game. */
export const TOP_UP = "top-up";

export const purchaseSchema = z
  .object({
    target: z.string().min(1, "Choose a game or wallet top-up"),
    kind: z.enum(["game", "in_game"]),
    amount: z.string().trim().min(1, "Enter an amount"),
    currency: z.enum(currencies),
    date: z.string().min(1, "Choose a date"),
    note: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (toMinor(values.amount, values.currency) === null) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Enter a positive amount" });
    }
    if (values.date > today()) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "That date is in the future" });
    }
  });

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export function editDefaults(purchase: Purchase): PurchaseFormValues {
  return {
    target: purchase.copy_id != null ? String(purchase.copy_id) : TOP_UP,
    kind: purchase.kind === "in_game" ? "in_game" : "game",
    amount: minorToInput(purchase.amount_minor, purchase.currency),
    currency: purchase.currency as Currency,
    date: localDate(purchase.purchased_at),
    note: purchase.note ?? "",
  };
}

export function newDefaults(target: string, bought: boolean, currency: Currency): PurchaseFormValues {
  return { target, kind: bought ? "in_game" : "game", amount: "", currency, date: today(), note: "" };
}

/**
 * Today keeps the real time so same-day purchases stay in order; past days use noon so time zones never shift the date.
 * An edit that leaves the date alone keeps the original timestamp.
 */
export function purchaseTimestamp(date: string, original?: string) {
  if (original && localDate(original) === date) {
    return original;
  }
  return (date === today() ? new Date() : new Date(`${date}T12:00:00`)).toISOString();
}
