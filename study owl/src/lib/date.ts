/**
 * Local-calendar date helpers.
 *
 * A task's due date is a plain calendar date ("YYYY-MM-DD") with no time
 * component and no timezone attached. Everything that compares dates must
 * therefore use the user's LOCAL calendar day, never the UTC day.
 *
 * Why this module exists: `new Date().toISOString().slice(0, 10)` returns the
 * UTC date. In any timezone ahead of UTC (e.g. UTC+6) it reports "tomorrow"
 * for the first six hours of the local day, which mis-filed a task due today
 * as "upcoming" and delayed "overdue" by a day. Always use `toLocalISODate`.
 */

/** A calendar date in the app's canonical `YYYY-MM-DD` form. */
export type ISODate = string;

/** Today's calendar date in the user's local timezone, as `YYYY-MM-DD`. */
export function toLocalISODate(d: Date = new Date()): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Today's local calendar date, as `YYYY-MM-DD`. */
export function todayISODate(): ISODate {
  return toLocalISODate();
}

/**
 * Builds a `YYYY-MM-DD` string that is `offsetDays` away from `base`.
 * Used to seed demo tasks relative to today so the buckets stay meaningful.
 */
export function addDaysISO(base: ISODate, offsetDays: number): ISODate {
  const [y, m, d] = base.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + offsetDays);
  return toLocalISODate(dt);
}

/**
 * Lexicographic comparison of two `YYYY-MM-DD` strings.
 * Zero-padded ISO dates sort chronologically, so no Date object is needed
 * (and no DST / timezone edge cases can creep in).
 */
export function compareISODate(a: ISODate, b: ISODate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** True when the string is a well-formed `YYYY-MM-DD` calendar date. */
export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/**
 * Formats a `YYYY-MM-DD` date for display, e.g. "Oct 21, 2026".
 * The string is split manually and rebuilt as LOCAL midnight — `new Date(iso)`
 * would be parsed as UTC midnight and could render the previous day in
 * negative-offset timezones.
 */
export function formatDueLabel(iso: ISODate): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
