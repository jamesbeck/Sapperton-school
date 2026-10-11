export const clubWeekdays = [
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
  { label: "Sunday", value: "sunday" },
];

export type ClubSession = {
  day: string;
  startTime: string;
  endTime: string;
};

export function isClubTime(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function validateClubSessions(value: unknown): true | string {
  if (value == null) return true;
  if (!Array.isArray(value)) return "Sessions must be a list.";
  const seen = new Set<string>();
  for (const session of value) {
    if (!session || !clubWeekdays.some(({ value }) => value === session.day)) {
      return "Choose a weekday for every session.";
    }
    if (!isClubTime(session.startTime) || !isClubTime(session.endTime)) {
      return "Enter each start and end time in 24-hour HH:mm format (e.g. 15:15).";
    }
    if (session.endTime <= session.startTime) {
      return "Each session must end after it starts on the same day.";
    }
    const key = `${session.day}:${session.startTime}:${session.endTime}`;
    if (seen.has(key))
      return "Remove duplicate sessions with the same day and times.";
    seen.add(key);
  }
  return true;
}

export function sortClubSessions<T extends ClubSession>(sessions: T[]): T[] {
  return [...sessions].sort(
    (a, b) =>
      clubWeekdays.findIndex(({ value }) => value === a.day) -
        clubWeekdays.findIndex(({ value }) => value === b.day) ||
      a.startTime.localeCompare(b.startTime),
  );
}

export function formatClubTime(time: string): string {
  if (!isClubTime(time)) return time;
  const [hour, minute] = time.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "am" : "pm"}`;
}

export function formatClubSession(session: ClubSession): string {
  const day =
    clubWeekdays.find(({ value }) => value === session.day)?.label ||
    session.day;
  return `${day}, ${formatClubTime(session.startTime)}–${formatClubTime(session.endTime)}`;
}
