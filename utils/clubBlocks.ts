import {
  clubWeekdays,
  validateClubSessions,
  type ClubSession,
} from "./clubSessions";

export type ClubBlock = {
  label: string;
  startDate: string;
  endDate: string;
  sessions?: ClubSession[] | null;
  excludedDates?: { date: string; reason?: string | null }[] | null;
  totalPrice?: number | null;
  showSessionPrice?: boolean | null;
  capacity?: number | null;
  bookingMethod: "parentpay" | "external" | "contact";
  bookingURL?: string | null;
  bookingStatus?: "unspecified" | "open" | "full" | "closed" | null;
  externalLeader?: string | null;
  snackProvided?: boolean | null;
  whatToBring?: string | null;
};

function dateKey(value: string): string {
  return value.slice(0, 10);
}
function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value))
    return false;
  const date = new Date(`${dateKey(value)}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateKey(value)
  );
}
export function validateBookingURL(value: unknown): true | string {
  if (!value) return true;
  try {
    if (
      typeof value === "string" &&
      ["https:", "http:"].includes(new URL(value).protocol)
    )
      return true;
  } catch {}
  return "Enter a complete http:// or https:// booking URL.";
}
export function validateClubBlocks(value: unknown): true | string {
  if (value == null) return true;
  if (!Array.isArray(value)) return "Term blocks must be a list.";
  for (const block of value) {
    if (!block || !validDate(block.startDate) || !validDate(block.endDate))
      return "Enter valid start and end dates for each block.";
    if (dateKey(block.endDate) < dateKey(block.startDate))
      return "A block must end on or after its start date.";
    if (!block.sessions?.length)
      return "Add at least one weekly session to each block.";
    const schedule = validateClubSessions(block.sessions);
    if (schedule !== true) return schedule;
    const exclusions = new Set();
    for (const exclusion of block.excludedDates || []) {
      if (
        !validDate(exclusion.date) ||
        dateKey(exclusion.date) < dateKey(block.startDate) ||
        dateKey(exclusion.date) > dateKey(block.endDate)
      )
        return "Excluded dates must fall within the block.";
      if (exclusions.has(dateKey(exclusion.date)))
        return "Remove duplicate excluded dates.";
      exclusions.add(dateKey(exclusion.date));
    }
    if (validateBookingURL(block.bookingURL) !== true)
      return validateBookingURL(block.bookingURL);
    if (block.bookingMethod === "external" && !block.bookingURL)
      return "External bookings need a booking URL.";
    if (countBlockSessions(block) === 0)
      return "The block must contain at least one scheduled session.";
  }
  return true;
}
export function countBlockSessions(block: ClubBlock): number {
  if (!validDate(block.startDate) || !validDate(block.endDate)) return 0;
  const exclusions = new Set(
    (block.excludedDates || []).map(({ date }) => dateKey(date)),
  );
  const start = new Date(`${dateKey(block.startDate)}T00:00:00Z`);
  const end = new Date(`${dateKey(block.endDate)}T00:00:00Z`);
  const weekly = new Map<number, number>();
  for (const session of block.sessions || []) {
    const day =
      (clubWeekdays.findIndex(({ value }) => value === session.day) + 1) % 7;
    weekly.set(day, (weekly.get(day) || 0) + 1);
  }
  let count = 0;
  for (
    let date = start;
    date <= end;
    date = new Date(date.getTime() + 86400000)
  ) {
    if (!exclusions.has(date.toISOString().slice(0, 10)))
      count += weekly.get(date.getUTCDay()) || 0;
  }
  return count;
}
export function formatBlockDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
export function formatClubPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}
export function getBlockState(
  block: ClubBlock,
  now = new Date(),
): "upcoming" | "current" | "past" {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return dateKey(block.endDate) < today
    ? "past"
    : dateKey(block.startDate) > today
      ? "upcoming"
      : "current";
}
export function getFeaturedBlock<T extends ClubBlock>(
  blocks: T[] | null | undefined,
  now = new Date(),
): T | undefined {
  const sorted = [...(blocks || [])].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );
  return (
    sorted.find((block) => getBlockState(block, now) === "current") ||
    sorted.find((block) => getBlockState(block, now) === "upcoming") ||
    sorted.at(-1)
  );
}
