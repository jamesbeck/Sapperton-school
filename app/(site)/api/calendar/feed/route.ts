import { NextRequest, NextResponse } from "next/server";
import payload from "@/payload";

// Revalidate every 5 minutes
export const revalidate = 300;

// Helper to format date to iCalendar format (YYYYMMDD or YYYYMMDDTHHMMSSZ)
function formatDateToICS(date: Date, allDay: boolean = false): string {
  if (allDay) {
    return date.toISOString().slice(0, 10).replace(/-/g, "");
  }
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

// Parse time string to hours and minutes
function parseTime(timeStr: string): [number, number] {
  const cleanTime = timeStr.trim().toUpperCase();
  const isPM = cleanTime.includes("PM");
  const isAM = cleanTime.includes("AM");

  const timePart = cleanTime.replace(/[AP]M/g, "").trim();
  const [hoursStr, minutesStr] = timePart.split(":");

  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr || "0", 10);

  if (isPM && hours !== 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return [hours, minutes];
}

// Escape special characters in iCalendar text
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function extractPlainText(
  richText: Record<string, unknown> | null | undefined
): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const root = richText as any;
  if (!root?.root?.children) return "";

  let text = "";
  const extractFromNode = (node: Record<string, unknown>) => {
    if (node.type === "text" && node.text) {
      text += node.text;
    }
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        extractFromNode(child as Record<string, unknown>);
      }
      // Add newline after paragraphs
      if (node.type === "paragraph") {
        text += "\n";
      }
    }
  };

  for (const child of root.root.children) {
    extractFromNode(child as Record<string, unknown>);
  }

  return text.trim();
}

// Get category label for event type
function getCategoryLabel(type: string): string {
  switch (type) {
    case "term-date":
      return "Term Date";
    case "event":
      return "School Event";
    case "open-day":
      return "Open Day";
    case "other":
      return "Other";
    default:
      return "Event";
  }
}

export async function GET(request: NextRequest) {
  try {
    // Parse class filter from query parameters
    const { searchParams } = new URL(request.url);
    const classesParam = searchParams.get("classes");
    const filterClassIds: number[] = classesParam
      ? classesParam
          .split(",")
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
      : [];

    // Fetch all future and recent past events (last 30 days for context)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const eventsResult = await payload.find({
      collection: "events",
      depth: 2,
      limit: 1000,
      sort: "date",
      where: {
        date: {
          greater_than_equal: thirtyDaysAgo.toISOString(),
        },
      },
    });

    // Filter events based on class selection
    let events = eventsResult.docs;

    if (filterClassIds.length > 0) {
      events = events.filter((event) => {
        // Always include events without classes (whole-school events)
        if (!event.classes || event.classes.length === 0) {
          return true;
        }
        // Include events that match any of the selected classes
        return event.classes.some((cls) => {
          const classId = typeof cls === "number" ? cls : cls.id;
          return filterClassIds.includes(classId);
        });
      });
    }

    // Generate calendar name based on classes
    let calendarName = "Sapperton School Calendar";
    if (filterClassIds.length > 0) {
      // We'll need to look up class names from the events
      const classNames = new Set<string>();
      events.forEach((event) => {
        if (event.classes) {
          event.classes.forEach((cls) => {
            if (
              typeof cls === "object" &&
              cls !== null &&
              filterClassIds.includes(cls.id)
            ) {
              classNames.add(cls.name);
            }
          });
        }
      });
      if (classNames.size > 0) {
        calendarName = `Sapperton School - ${Array.from(classNames).join(", ")}`;
      }
    }

    // Build iCalendar content
    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sapperton School//School Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${calendarName}`,
      "X-WR-TIMEZONE:Europe/London",
      "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
      "X-PUBLISHED-TTL:PT1H",
    ];

    // Add timezone definition for UK
    lines.push(
      "BEGIN:VTIMEZONE",
      "TZID:Europe/London",
      "BEGIN:DAYLIGHT",
      "TZOFFSETFROM:+0000",
      "TZOFFSETTO:+0100",
      "TZNAME:BST",
      "DTSTART:19700329T010000",
      "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
      "END:DAYLIGHT",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:+0100",
      "TZOFFSETTO:+0000",
      "TZNAME:GMT",
      "DTSTART:19701025T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
      "END:STANDARD",
      "END:VTIMEZONE"
    );

    for (const event of events) {
      const startDate = new Date(event.date);
      let endDate: Date;

      if (event.endDate) {
        endDate = new Date(event.endDate);
      } else {
        endDate = new Date(startDate);
      }

      // Determine if it's an all-day event
      const isAllDay = !event.startTime && !event.endTime;

      // Apply times if provided
      if (event.startTime) {
        const [hours, minutes] = parseTime(event.startTime);
        startDate.setHours(hours, minutes, 0, 0);
      }

      if (event.endTime) {
        const [hours, minutes] = parseTime(event.endTime);
        endDate.setHours(hours, minutes, 0, 0);
      } else if (!isAllDay && event.startTime) {
        // Default to 1 hour duration if only start time is provided
        endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);
      }

      // For all-day events, end date should be the next day (exclusive)
      if (isAllDay) {
        endDate.setDate(endDate.getDate() + 1);
      }

      // Create UID based on event ID and domain
      const uid = `event-${event.id}@sappertonschool.org`;

      // Get description text
      const description = extractPlainText(event.description);

      // Get class names if any
      let classInfo = "";
      if (event.classes && event.classes.length > 0) {
        const classNames = event.classes
          .map((cls) =>
            typeof cls === "object" && cls !== null ? cls.name : ""
          )
          .filter(Boolean);
        if (classNames.length > 0) {
          classInfo = `Classes: ${classNames.join(", ")}\n\n`;
        }
      }

      const fullDescription = classInfo + description;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${formatDateToICS(new Date())}`);

      if (isAllDay) {
        lines.push(`DTSTART;VALUE=DATE:${formatDateToICS(startDate, true)}`);
        lines.push(`DTEND;VALUE=DATE:${formatDateToICS(endDate, true)}`);
      } else {
        lines.push(
          `DTSTART;TZID=Europe/London:${formatDateToICS(startDate).slice(0, -1)}`
        );
        lines.push(
          `DTEND;TZID=Europe/London:${formatDateToICS(endDate).slice(0, -1)}`
        );
      }

      lines.push(`SUMMARY:${escapeICSText(event.name)}`);

      if (fullDescription) {
        lines.push(`DESCRIPTION:${escapeICSText(fullDescription)}`);
      }

      lines.push(`CATEGORIES:${getCategoryLabel(event.type)}`);
      lines.push(`URL:https://www.sappertonschool.org/events/${event.id}`);
      lines.push(`LAST-MODIFIED:${formatDateToICS(new Date(event.updatedAt))}`);
      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    // Join with CRLF as per iCalendar spec
    const icsContent = lines.join("\r\n");

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="sapperton-school-calendar.ics"',
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Error generating calendar feed:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar feed" },
      { status: 500 }
    );
  }
}
