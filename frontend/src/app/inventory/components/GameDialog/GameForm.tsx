import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ErrorNote } from "@app/shared/components/ErrorNote";
import { MoneyFields } from "@app/shared/components/MoneyFields";
import { OptionSelect } from "@app/shared/components/OptionSelect";
import { TextField } from "@app/shared/components/TextField";
import { useDebouncedValue } from "@app/shared/hooks/useDebouncedValue";
import { optionItems } from "@app/shared/utils/options";
import { toMinor } from "@app/shared/utils/money";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/api/client";
import { useCreateCopy, useUpdateCopy } from "@/api/games/hooks";
import { acquisitions, intents, platforms, statuses, type Copy, type CopyRequest } from "@/api/games/types";
import type { IgdbMatch } from "@/api/igdb/types";
import { useDisplayCurrency } from "@/api/settings/hooks";
import { gameDefaults, gameSchema, rememberDetails, type GameFormValues } from "./schema";
import { IgdbPicker } from "./IgdbPicker";

function now() {
  return new Date().toISOString();
}

const detailFields = [
  { name: "platform", label: "Platform", options: platforms },
  { name: "status", label: "Status", options: statuses },
  { name: "intent", label: "Intent", options: intents },
  { name: "acquisition", label: "Got it as", options: acquisitions },
] as const;

export function GameForm({ copy, onDone }: { copy: Copy | null; onDone: () => void }) {
  const create = useCreateCopy();
  const update = useUpdateCopy();
  const saving = copy ? update : create;
  const currency = useDisplayCurrency();
  const [picked, setPicked] = useState<IgdbMatch | null>(null);
  const { register, handleSubmit, control, setValue, formState } = useForm<GameFormValues>({
    resolver: zodResolver(gameSchema(copy == null)),
    defaultValues: gameDefaults(copy, currency),
  });
  const [title, acquisition, priceCurrency] = useWatch({ control, name: ["title", "acquisition", "currency"] });
  const debounced = useDebouncedValue(title.trim(), 300);
  const asksPrice = copy == null && acquisition === "purchased";

  // Typing over a picked match unlinks it.
  const linked = picked && title.trim() === picked.name ? picked : null;
  // When editing, matches appear only once the title is changed.
  const query = debounced === copy?.title ? "" : debounced;

  function pick(match: IgdbMatch) {
    setPicked(match);
    setValue("title", match.name, { shouldValidate: true });
  }

  function save({ title: typed, amount, currency: paidIn, ...details }: GameFormValues) {
    const keepsLink = copy != null && typed.trim() === copy.title;
    const request: CopyRequest = {
      ...details,
      title: linked?.name ?? typed,
      igdb_id: linked?.igdb_id ?? (keepsLink ? copy.igdb_id : null),
    };
    const onSuccess = (saved: Copy) => {
      toast.success(copy ? `${saved.title} updated` : `${saved.title} added to your inventory`);
      onDone();
    };
    if (copy) {
      update.mutate({ copy, ...request }, { onSuccess });
      return;
    }
    rememberDetails(details);
    const purchase = asksPrice
      ? { amount_minor: toMinor(amount, paidIn)!, currency: paidIn, purchased_at: now() }
      : null;
    create.mutate({ copy: request, purchase }, { onSuccess });
  }

  return (
    <form onSubmit={handleSubmit(save)} className="flex flex-col gap-4">
      <TextField
        id="game-title"
        label="Title"
        large
        autoFocus
        placeholder="Hades, Celeste, Elden Ring…"
        error={formState.errors.title}
        {...register("title")}
      />

      <IgdbPicker query={query} linked={linked} onPick={pick} onUnlink={() => setPicked(null)} />

      <div className="grid grid-cols-2 gap-3">
        {detailFields.map(({ name, label, options }) => (
          <Controller
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <OptionSelect
                id={`game-${name}`}
                label={label}
                value={field.value}
                items={optionItems(options)}
                onChange={field.onChange}
              />
            )}
          />
        ))}
      </div>

      {asksPrice ? (
        <MoneyFields
          id="game-price"
          label="Price paid"
          amount={register("amount")}
          error={formState.errors.amount}
          currency={priceCurrency}
          onCurrencyChange={(next) => setValue("currency", next)}
        />
      ) : null}

      {saving.isError ? <ErrorNote>{errorMessage(saving.error, "Could not save that game.")}</ErrorNote> : null}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={saving.isPending || title.trim() === ""}
          className="px-5 font-semibold"
        >
          {saving.isPending ? "Saving…" : copy ? "Save changes" : "Add game"}
        </Button>
      </div>
    </form>
  );
}
