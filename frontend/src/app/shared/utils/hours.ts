function roundedHours(minutes: number) {
  return Math.round((minutes / 60) * 10) / 10;
}

export function formatHours(minutes: number) {
  return `${roundedHours(minutes).toLocaleString("en-IN")} h`;
}

/** "+3 h", or "−1 h" when hours were corrected down. */
export function formatHoursChange(minutes: number) {
  return minutes < 0 ? `−${formatHours(-minutes)}` : `+${formatHours(minutes)}`;
}

export function minutesToHoursInput(minutes: number | null) {
  return minutes == null ? "" : String(roundedHours(minutes));
}
