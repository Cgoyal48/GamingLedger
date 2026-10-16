const DAY_MS = 24 * 60 * 60 * 1000;

const day = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" });
const month = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

/** Today as YYYY-MM-DD in the browser's time zone, the format date inputs use. */
export function today() {
  return new Date().toLocaleDateString("en-CA");
}

/** The YYYY-MM-DD date of a timestamp in the browser's time zone. */
export function localDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString("en-CA");
}

/** Whole days from a timestamp until now. */
export function daysSince(timestamp: string) {
  return Math.floor((Date.now() - new Date(timestamp).getTime()) / DAY_MS);
}

/** "04 Oct" */
export function formatDay(timestamp: string) {
  return day.format(new Date(timestamp));
}

/** "October 2026" */
export function formatMonth(timestamp: string) {
  return month.format(new Date(timestamp));
}
