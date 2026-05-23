const PH_TIMEZONE = "Asia/Manila";
const LOCALE = "en-PH";

/** Format a UTC ISO string as the date line shown on event cards.
 *  e.g. "Sun, May 17 · 2:00 PM PHT" */
export function formatEventDateTime(isoUtc: string): string {
  const date = new Date(isoUtc);
  const dayPart = new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: PH_TIMEZONE,
  }).format(date);
  const timePart = new Intl.DateTimeFormat(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: PH_TIMEZONE,
  }).format(date);
  return `${dayPart} · ${timePart} PHT`;
}

/** Format just the time portion in PHT — e.g. "2:00 PM". */
export function formatEventTime(isoUtc: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: PH_TIMEZONE,
  }).format(new Date(isoUtc));
}

/** Parse a host's local PHT datetime input (from <input type="datetime-local">)
 *  and return a UTC ISO string suitable for insert into Postgres.
 *
 *  The input string format is "YYYY-MM-DDTHH:mm" (no timezone). We interpret
 *  it as Asia/Manila wall-clock and produce the corresponding UTC instant.
 *  PH is UTC+8 year-round (no DST). */
export function phLocalInputToUtcIso(input: string): string {
  const [datePart, timePart] = input.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const utc = Date.UTC(y, m - 1, d, hh - 8, mm);
  return new Date(utc).toISOString();
}

/** Format a price column (numeric) as a peso string, or "Free" when null/0. */
export function formatPrice(pricePhp: number | null): string {
  if (pricePhp === null || pricePhp === 0) return "Free";
  return `₱${pricePhp.toLocaleString("en-PH")}`;
}
