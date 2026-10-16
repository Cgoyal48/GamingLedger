import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ErrorNote } from "@app/shared/components/ErrorNote";
import { LockedField } from "@app/shared/components/LockedField";
import { MoneyFields } from "@app/shared/components/MoneyFields";
import { OptionSelect } from "@app/shared/components/OptionSelect";
import { TextField } from "@app/shared/components/TextField";
import { today } from "@app/shared/utils/dates";
import { labels } from "@app/shared/constants/labels";
import { formatMoney, toMinor } from "@app/shared/utils/money";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/api/client";
import { useCopies } from "@/api/games/hooks";
import { useBoughtCopyIds, useCreatePurchase, useUpdatePurchase } from "@/api/purchases/hooks";
import type { Purchase, PurchaseRequest } from "@/api/purchases/types";
import { useDisplayCurrency } from "@/api/settings/hooks";
import {
  editDefaults,
  newDefaults,
  purchaseSchema,
  purchaseTimestamp,
  TOP_UP,
  type PurchaseFormValues,
} from "./schema";

const kindItems = [
  { value: "game" as const, label: labels.game },
  { value: "in_game" as const, label: labels.in_game },
];

export function PurchaseForm({
  copyId,
  editing,
  onDone,
}: {
  copyId: number | null;
  editing: Purchase | null;
  onDone: () => void;
}) {
  const games = useCopies().data ?? [];
  const currency = useDisplayCurrency();
  const create = useCreatePurchase();
  const update = useUpdatePurchase();
  const saving = editing ? update : create;
  // A copy is bought once; after that, everything spent on it is in-game.
  const bought = useBoughtCopyIds(editing?.id);
  const isBought = (target: string) => target !== TOP_UP && bought.has(Number(target));
  const initialTarget = copyId != null ? String(copyId) : games.length > 0 ? String(games[0].id) : TOP_UP;

  const { register, control, handleSubmit, setValue, formState } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: editing ? editDefaults(editing) : newDefaults(initialTarget, isBought(initialTarget), currency),
  });
  const [target, paidIn] = useWatch({ control, name: ["target", "currency"] });
  const isTopUp = target === TOP_UP;

  const targets = [
    ...games.map((copy) => ({ value: String(copy.id), label: `${copy.title} · ${labels[copy.platform]}` })),
    { value: TOP_UP, label: labels.top_up },
  ];

  function save(values: PurchaseFormValues) {
    const topUp = values.target === TOP_UP;
    const amountMinor = toMinor(values.amount, values.currency)!;
    const request: PurchaseRequest = {
      copy_id: topUp ? null : Number(values.target),
      kind: topUp ? "top_up" : isBought(values.target) ? "in_game" : values.kind,
      amount_minor: amountMinor,
      currency: values.currency,
      purchased_at: purchaseTimestamp(values.date, editing?.purchased_at),
      note: values.note === "" ? null : values.note,
    };
    const onSuccess = () => {
      toast.success(editing ? "Purchase updated" : `Logged ${formatMoney(amountMinor, values.currency)}`);
      onDone();
    };
    if (editing) {
      update.mutate({ id: editing.id, ...request }, { onSuccess });
    } else {
      create.mutate(request, { onSuccess });
    }
  }

  return (
    <form onSubmit={handleSubmit(save)} className="flex flex-col gap-4">
      <Controller
        control={control}
        name="target"
        render={({ field }) => (
          <OptionSelect
            id="purchase-target"
            label="For"
            value={field.value}
            items={targets}
            onChange={field.onChange}
          />
        )}
      />

      <MoneyFields
        id="purchase"
        label="Amount"
        large
        autoFocus
        amount={register("amount")}
        error={formState.errors.amount}
        currency={paidIn}
        onCurrencyChange={(next) => setValue("currency", next)}
      />

      <div className="grid grid-cols-2 gap-3">
        {isTopUp ? (
          <LockedField label="What" value={labels.top_up} hint="Not tied to a game" />
        ) : isBought(target) ? (
          <LockedField label="What" value={labels.in_game} hint="The game is already logged" />
        ) : (
          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <OptionSelect
                id="purchase-kind"
                label="What"
                value={field.value}
                items={kindItems}
                onChange={field.onChange}
              />
            )}
          />
        )}
        <TextField
          id="purchase-date"
          label="Date"
          type="date"
          max={today()}
          className="numeric"
          error={formState.errors.date}
          {...register("date")}
        />
      </div>

      <TextField id="purchase-note" label="Note (optional)" {...register("note")} />

      {saving.isError ? <ErrorNote>{errorMessage(saving.error, "Could not save that purchase.")}</ErrorNote> : null}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={saving.isPending} className="px-5 font-semibold">
          {saving.isPending ? "Saving…" : editing ? "Save changes" : "Log it"}
        </Button>
      </div>
    </form>
  );
}
