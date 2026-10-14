import type { ClubSession } from "@/utils/clubSessions";
import { formatClubSession, sortClubSessions } from "@/utils/clubSessions";

export default function ClubSessions({
  sessions,
}: {
  sessions?: (ClubSession & { id?: string | null })[] | null;
}) {
  if (!sessions?.length)
    return <p className="text-center">Session times will be confirmed soon.</p>;
  return (
    <ul className="flex flex-col gap-2">
      {sortClubSessions(sessions).map((session) => (
        <li
          key={
            session.id ||
            `${session.day}-${session.startTime}-${session.endTime}`
          }
        >
          {formatClubSession(session)}
        </li>
      ))}
    </ul>
  );
}
