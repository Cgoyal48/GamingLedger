import { z } from "zod";
import { toMinor } from "@app/shared/utils/money";
import { acquisitions, intents, platforms, statuses, type Copy, type CopyDetails } from "@/api/games/types";
import { currencies, type Currency } from "@/api/settings/types";

const fields = z.object({
  title: z.string().trim().min(1, "Enter a title"),
  platform: z.enum(platforms),
  status: z.enum(statuses),
  intent: z.enum(intents),
  acquisition: z.enum(acquisitions),
  amount: z.string().trim(),
  currency: z.enum(currencies),
});

export type GameFormValues = z.infer<typeof fields>;

/** Only a newly added purchased game asks for its price; edits change prices in the loot log. */
export function gameSchema(asksPrice: boolean) {
  return fields.superRefine((values, ctx) => {
    if (asksPrice && values.acquisition === "purchased" && toMinor(values.amount, values.currency) === null) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Enter what you paid" });
    }
  });
}

// Adding several games in a row usually means the same platform and status.
let remembered: CopyDetails = {
  platform: "steam",
  status: "unplayed",
  intent: "to_play",
  acquisition: "purchased",
};

export function rememberDetails(details: CopyDetails) {
  remembered = details;
}

export function gameDefaults(copy: Copy | null, currency: Currency): GameFormValues {
  const price = { amount: "", currency };
  if (!copy) {
    return { title: "", ...remembered, ...price };
  }
  const { title, platform, status, intent, acquisition } = copy;
  return { title, platform, status, intent, acquisition, ...price };
}
