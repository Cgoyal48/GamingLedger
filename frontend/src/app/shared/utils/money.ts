const formatters = new Map<string, Intl.NumberFormat>();

function formatter(currency: string) {
  let format = formatters.get(currency);
  if (!format) {
    format = new Intl.NumberFormat("en-IN", { style: "currency", currency, trailingZeroDisplay: "stripIfInteger" });
    formatters.set(currency, format);
  }
  return format;
}

function minorDigits(currency: string) {
  return formatter(currency).resolvedOptions().maximumFractionDigits ?? 2;
}

/** Parses "499" or "9.99" into minor units without floating point. Null if invalid or not positive. */
export function toMinor(amount: string, currency: string): number | null {
  const digits = minorDigits(currency);
  const match = /^(\d+)(?:\.(\d+))?$/.exec(amount.trim());
  if (!match) {
    return null;
  }
  const fraction = match[2] ?? "";
  if (fraction.length > digits) {
    return null;
  }
  const minor = Number(match[1] + fraction.padEnd(digits, "0"));
  return Number.isSafeInteger(minor) && minor > 0 ? minor : null;
}

/** The inverse of toMinor: 999 USD becomes "9.99", 49900 INR becomes "499". */
export function minorToInput(amountMinor: number, currency: string) {
  const digits = minorDigits(currency);
  if (digits === 0) {
    return String(amountMinor);
  }
  const scale = 10 ** digits;
  const fraction = String(amountMinor % scale)
    .padStart(digits, "0")
    .replace(/0+$/, "");
  const whole = String(Math.floor(amountMinor / scale));
  return fraction === "" ? whole : `${whole}.${fraction}`;
}

export function formatMoney(amountMinor: number, currency: string) {
  return formatter(currency).format(amountMinor / 10 ** minorDigits(currency));
}

/** A converted amount is approximate, so it gets a leading ≈. */
export function formatApprox(amountMinor: number, currency: string, converted: boolean) {
  return (converted ? "≈" : "") + formatMoney(amountMinor, currency);
}
