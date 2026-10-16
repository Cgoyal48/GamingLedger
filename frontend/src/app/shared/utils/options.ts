import { labels } from "@app/shared/constants/labels";
import { swatches } from "@app/shared/constants/swatches";

/** Select items for API enum values, labelled for display. */
export function optionItems<T extends string>(values: readonly T[]) {
  return values.map((value) => ({ value, label: labels[value] ?? value, swatch: swatches[value] }));
}
