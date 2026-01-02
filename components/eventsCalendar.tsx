"use client";
import { Event, Class } from "@/payload-types";
import EventCard from "@/components/eventCard";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Calendar as CalendarIcon,
  List,
  Eye,
  EyeOff,
} from "lucide-react";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enGB } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup date-fns localizer for react-big-calendar
const locales = {
  "en-GB": enGB,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface EventsByDay {
  [dateKey: string]: {
    date: Date;
    events: Event[];
  };
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Event;
}

type ViewType = "calendar" | "list";
type EventType = "term-date" | "event" | "open-day" | "other";

const EVENT_TYPES: { type: EventType; label: string }[] = [
  { type: "term-date", label: "Term Dates" },
  { type: "event", label: "Events" },
  { type: "open-day", label: "Open Days" },
  { type: "other", label: "Other" },
];

// Get background color for event type
const getEventBackgroundColor = (type: string): string => {
  switch (type) {
    case "term-date":
      return "#3b82f6"; // blue-500
    case "event":
      return "#347560"; // sapperton-green
    case "open-day":
      return "#8b5cf6"; // purple-500
    case "other":
      return "#6b7280"; // gray-500
    default:
      return "#6b7280";
  }
};

// Get border color for event type
const getEventBorderColor = (type: string): string => {
  switch (type) {
    case "term-date":
      return "#1d4ed8"; // blue-700
    case "event":
      return "#1f4d3a"; // darker sapperton-green
    case "open-day":
      return "#6d28d9"; // purple-700
    case "other":
      return "#374151"; // gray-700
    default:
      return "#374151";
  }
};

export default function EventsCalendar({ events }: { events: Event[] }) {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [viewType, setViewType] = useState<ViewType>("calendar");
  const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [hiddenTypes, setHiddenTypes] = useState<Set<EventType>>(new Set());
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Extract unique classes from all events
  const uniqueClasses = useMemo(() => {
    const classMap = new Map<number, Class>();
    events.forEach((event) => {
      if (event.classes && event.classes.length > 0) {
        event.classes.forEach((cls) => {
          if (typeof cls !== "number" && cls.id) {
            classMap.set(cls.id, cls as Class);
          }
        });
      }
    });
    return Array.from(classMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [events]);

  // Toggle event type visibility
  const toggleTypeVisibility = (type: EventType) => {
    setHiddenTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  // Filter events based on type visibility and class filter
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Check type visibility
      if (hiddenTypes.has(event.type as EventType)) return false;
      // Check class filter
      if (selectedClassId) {
        // Include events with no classes (whole-school events) as they apply to everyone
        if (!event.classes || event.classes.length === 0) {
          return true;
        }
        const matchesClass = event.classes.some((cls) => {
          const classId = typeof cls === "number" ? cls : cls.id;
          return classId.toString() === selectedClassId;
        });
        if (!matchesClass) return false;
      }
      return true;
    });
  }, [events, hiddenTypes, selectedClassId]);

  // Convert filtered events to react-big-calendar format
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return filteredEvents.map((event) => {
      const startDate = new Date(event.date);
      let endDate: Date;

      if (event.endDate) {
        endDate = new Date(event.endDate);
        // For multi-day events, set end to end of day
        endDate.setHours(23, 59, 59);
      } else {
        endDate = new Date(startDate);
      }

      // If there are specific times, parse them
      if (event.startTime) {
        const [hours, minutes] = parseTime(event.startTime);
        startDate.setHours(hours, minutes, 0);
      }

      if (event.endTime && !event.endDate) {
        const [hours, minutes] = parseTime(event.endTime);
        endDate.setHours(hours, minutes, 0);
      } else if (event.endTime && event.endDate) {
        const [hours, minutes] = parseTime(event.endTime);
        endDate.setHours(hours, minutes, 0);
      }

      // Determine if it's an all-day event
      const isAllDay = !event.startTime && !event.endTime;

      return {
        id: event.id,
        title: event.name,
        start: startDate,
        end: endDate,
        allDay: isAllDay,
        resource: event,
      };
    });
  }, [filteredEvents]);

  // Parse time string to hours and minutes
  function parseTime(timeStr: string): [number, number] {
    // Handle formats like "09:00", "9:00", "2:30 PM", "14:30"
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

  // Group filtered events by day for list view
  const eventsByDay: EventsByDay = useMemo(() => {
    return filteredEvents.reduce((acc, event) => {
      const dateKey = new Date(event.date).toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: new Date(event.date),
          events: [],
        };
      }
      acc[dateKey].events.push(event);
      return acc;
    }, {} as EventsByDay);
  }, [filteredEvents]);

  // Sort dates
  const sortedDates = Object.keys(eventsByDay).sort();

  // Get unique months for filtering (from all events, not filtered)
  const uniqueMonths = useMemo(() => {
    const allDates = events.map((event) => {
      const date = new Date(event.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    });
    return Array.from(new Set(allDates)).sort();
  }, [events]);

  // Filter dates by selected month
  const filteredDates = selectedMonth
    ? sortedDates.filter((dateKey) => {
        const date = new Date(dateKey);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return monthKey === selectedMonth;
      })
    : sortedDates;

  const scrollToDate = (dateKey: string) => {
    const element = dateRefs.current[dateKey];
    if (element) {
      const yOffset = -100;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const formatDayHeader = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatMonthOption = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
    });
  };

  const formatDateForNav = (dateKey: string) => {
    const date = new Date(dateKey);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  // Get class names for an event
  const getClassNames = (event: Event): string[] => {
    if (!event.classes || event.classes.length === 0) return [];
    return event.classes
      .map((cls) => {
        if (typeof cls === "number") return "";
        return (cls as Class).name;
      })
      .filter(Boolean);
  };

  // Custom event styling for the calendar
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const eventType = event.resource.type;
    const backgroundColor = getEventBackgroundColor(eventType);
    const borderColor = getEventBorderColor(eventType);

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: "2px",
        borderStyle: "solid",
        borderRadius: "4px",
        color: "white",
        fontSize: "0.75rem",
        padding: "2px 4px",
      },
    };
  }, []);

  // Custom event component for the calendar
  const EventComponent = useCallback(({ event }: { event: CalendarEvent }) => {
    const classNames = getClassNames(event.resource);
    const eventType = event.resource.type;

    return (
      <div className="flex flex-col gap-0.5 overflow-hidden">
        <span className="font-medium truncate">{event.title}</span>
        <div className="flex flex-wrap gap-1">
          {eventType === "term-date" && (
            <span className="text-[10px] bg-white/20 px-1 rounded">Term</span>
          )}
          {eventType === "open-day" && (
            <span className="text-[10px] bg-white/20 px-1 rounded">
              Open Day
            </span>
          )}
          {classNames.length > 0 &&
            classNames.slice(0, 2).map((name, idx) => (
              <span key={idx} className="text-[10px] bg-white/30 px-1 rounded">
                {name}
              </span>
            ))}
          {classNames.length > 2 && (
            <span className="text-[10px] bg-white/20 px-1 rounded">
              +{classNames.length - 2}
            </span>
          )}
        </div>
      </div>
    );
  }, []);

  // Handle event click
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    window.location.href = `/events/${event.id}`;
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setCalendarDate(newDate);
  }, []);

  // Handle view change
  const handleViewChange = useCallback((newView: View) => {
    setCalendarView(newView);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Controls header */}
      <div className="flex flex-col gap-4 sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-4 border-b border-gray-200">
        {/* View toggle and month filter */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewType("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === "calendar"
                  ? "bg-white text-sapperton-green shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setViewType("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === "list"
                  ? "bg-white text-sapperton-green shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>

          {/* Month filter - only show in list view */}
          {viewType === "list" && (
            <div className="flex items-center gap-4">
              <label htmlFor="month-filter" className="text-sm font-semibold">
                Filter by month:
              </label>
              <div className="relative">
                <select
                  id="month-filter"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sapperton-green focus:border-transparent"
                >
                  <option value="">All Events</option>
                  {uniqueMonths.map((monthKey) => (
                    <option key={monthKey} value={monthKey}>
                      {formatMonthOption(monthKey)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              {selectedMonth && (
                <button
                  onClick={() => setSelectedMonth("")}
                  className="text-sm text-sapperton-green hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Class filter and type filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Class filter */}
          {uniqueClasses.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="class-filter" className="text-sm font-semibold">
                Class:
              </label>
              <div className="relative">
                <select
                  id="class-filter"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sapperton-green focus:border-transparent"
                >
                  <option value="">Any Class</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              {selectedClassId && (
                <button
                  onClick={() => setSelectedClassId("")}
                  className="text-sm text-sapperton-green hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Divider - only on desktop when class filter is visible */}
          {uniqueClasses.length > 0 && (
            <div className="hidden sm:block w-px h-6 bg-gray-300" />
          )}

          {/* Interactive Legend - click to show/hide event types */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-gray-700 mr-2">
              Filter by type:
            </span>
            {EVENT_TYPES.map(({ type, label }) => {
              const isHidden = hiddenTypes.has(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleTypeVisibility(type)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    isHidden
                      ? "bg-gray-100 border-gray-300 opacity-50"
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }`}
                  title={isHidden ? `Show ${label}` : `Hide ${label}`}
                >
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: getEventBackgroundColor(type),
                      opacity: isHidden ? 0.4 : 1,
                    }}
                  />
                  <span
                    className={isHidden ? "line-through text-gray-400" : ""}
                  >
                    {label}
                  </span>
                  {isHidden ? (
                    <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>
              );
            })}
            {hiddenTypes.size > 0 && (
              <button
                onClick={() => setHiddenTypes(new Set())}
                className="text-sm text-sapperton-green hover:underline ml-2"
              >
                Show all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewType === "calendar" && (
        <div className="events-calendar-container">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "auto", minHeight: 700 }}
            view={calendarView}
            onView={handleViewChange}
            date={calendarDate}
            onNavigate={handleNavigate}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent,
            }}
            onSelectEvent={handleSelectEvent}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            popup
            selectable={false}
            showAllEvents
          />
        </div>
      )}

      {/* List View */}
      {viewType === "list" && (
        <>
          {filteredDates.length > 0 ? (
            <div className="flex flex-col gap-8">
              {filteredDates.map((dateKey) => {
                const dayData = eventsByDay[dateKey];
                return (
                  <div
                    key={dateKey}
                    ref={(el) => {
                      dateRefs.current[dateKey] = el;
                    }}
                    className="scroll-mt-32"
                  >
                    <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-sapperton-green">
                      {formatDayHeader(dayData.date)}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {dayData.events.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No events found for this period.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
