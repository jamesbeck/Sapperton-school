import type { Club } from "@/payload-types";
import { formatClubSession, sortClubSessions } from "@/utils/clubSessions";

export default function ClubSessions({
  sessions,
}: {
  sessions: Club["sessions"];
}) {
  if (!sessions?.length)
    return <p className="text-center">Session times will be confirmed soon.</p>;
  return (
    <ul className="flex flex-col gap-2 text-center">
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
