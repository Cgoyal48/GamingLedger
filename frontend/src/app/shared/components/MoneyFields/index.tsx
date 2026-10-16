import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { OptionSelect } from "@app/shared/components/OptionSelect";
import { TextField } from "@app/shared/components/TextField";
import { currencies, type Currency } from "@/api/settings/types";

const currencyItems = currencies.map((code) => ({ value: code, label: code }));

/** An amount typed as text, so "9.99" is parsed exactly, beside the currency it was paid in. */
export function MoneyFields({
  id,
  label,
  amount,
  error,
  currency,
  onCurrencyChange,
  large = false,
  autoFocus = false,
}: {
  id: string;
  label: string;
  amount: UseFormRegisterReturn;
  error?: FieldError;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  large?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_7rem] gap-3">
      <TextField
        id={`${id}-amount`}
        label={label}
        error={error}
        large={large}
        autoFocus={autoFocus}
        inputMode="decimal"
        placeholder="499"
        className={large ? "numeric text-lg" : "numeric"}
        {...amount}
      />
      <OptionSelect
        id={`${id}-currency`}
        label="Currency"
        value={currency}
        items={currencyItems}
        onChange={onCurrencyChange}
      />
    </div>
  );
}
