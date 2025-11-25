"use client";
import { HoverScale } from "@/utils/hoverScale";
import { Event, Class } from "@/payload-types";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

export default function EventCard({ event }: { event: Event }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case "term-date":
        return "Term Date";
      case "event":
        return "Event";
      case "open-day":
        return "Open Day";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "term-date":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-green-100 text-green-800";
      case "open-day":
        return "bg-purple-100 text-purple-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDescriptionText = () => {
    if (!event.description?.root?.children) return "";

    let text = "";
    for (const child of event.description.root.children) {
      if (child.type === "paragraph" && "children" in child) {
        const children = child.children as Array<{
          type: string;
          text?: string;
          [key: string]: unknown;
        }>;
        for (const textNode of children) {
          if (textNode.type === "text" && textNode.text) {
            text += textNode.text;
          }
        }
        if (text) break; // Get first paragraph only
      }
    }

    // Trim to approximately 150 characters
    if (text.length > 150) {
      return text.substring(0, 150).trim() + "...";
    }
    return text;
  };

  const getTimeDisplay = () => {
    const parts = [];

    if (event.startTime) {
      parts.push(event.startTime);
    }

    if (event.endTime) {
      parts.push(event.endTime);
    }

    if (parts.length === 2) {
      return `${parts[0]} - ${parts[1]}`;
    } else if (parts.length === 1) {
      return parts[0];
    }

    return null;
  };

  const getDateDisplay = () => {
    if (!event.endDate || event.endDate === event.date) {
      return formatDate(event.date);
    }
    return `${formatShortDate(event.date)} - ${formatDate(event.endDate)}`;
  };

  const timeDisplay = getTimeDisplay();

  return (
    <Link href={`/events/${event.id}`}>
      <HoverScale>
        <div className="flex gap-4 group p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
          {/* Date badge */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-sapperton-green text-white rounded-lg">
            <span className="text-xs font-semibold uppercase">
              {new Date(event.date).toLocaleDateString("en-GB", {
                month: "short",
              })}
            </span>
            <span className="text-2xl font-bold">
              {new Date(event.date).getDate()}
            </span>
          </div>

          {/* Event details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-bold group-hover:underline line-clamp-2 text-gray-900">
                {event.name}
              </h3>
              <span
                className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded ${getCategoryColor(
                  event.type
                )}`}
              >
                {getCategoryLabel(event.type)}
              </span>
            </div>

            <div className="flex flex-col gap-1 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{getDateDisplay()}</span>
              </div>
              {timeDisplay && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{timeDisplay}</span>
                </div>
              )}
            </div>

            {event.classes && event.classes.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {event.classes.map((classItem) => {
                  const classData =
                    typeof classItem === "object" ? (classItem as Class) : null;
                  return classData ? (
                    <span
                      key={classData.id}
                      className="text-xs font-semibold px-2 py-1 bg-sapperton-green text-white rounded"
                    >
                      {classData.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}

            <p className="text-sm text-gray-700 line-clamp-2">
              {getDescriptionText()}
            </p>
          </div>
        </div>
      </HoverScale>
    </Link>
  );
}
