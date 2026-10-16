export const currencies = ["INR", "USD", "EUR", "GBP", "JPY"] as const;
export type Currency = (typeof currencies)[number];

export type Settings = { display_currency: Currency };
