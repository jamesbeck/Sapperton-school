"use client";
import { Event } from "@/payload-types";
import EventCard from "@/components/eventCard";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface EventsByDay {
  [dateKey: string]: {
    date: Date;
    events: Event[];
  };
}

export default function EventsCalendar({ events }: { events: Event[] }) {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Group events by day
  const eventsByDay: EventsByDay = events.reduce((acc, event) => {
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

  // Sort dates
  const sortedDates = Object.keys(eventsByDay).sort();

  // Get unique months for filtering
  const uniqueMonths = Array.from(
    new Set(
      sortedDates.map((dateKey) => {
        const date = new Date(dateKey);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      })
    )
  );

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
      const yOffset = -100; // Offset for fixed headers if any
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
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

  return (
    <div className="flex flex-col gap-8">
      {/* Month filter and date navigation */}
      <div className="flex flex-col gap-4 sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-4 border-b border-gray-200">
        {/* Month filter */}
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

        {/* Date quick navigation */}
        {filteredDates.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-700">Jump to:</span>
            {filteredDates.map((dateKey) => (
              <button
                key={dateKey}
                onClick={() => scrollToDate(dateKey)}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-sapperton-green hover:text-white rounded-full transition-colors"
              >
                {formatDateForNav(dateKey)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Events grouped by day */}
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
    </div>
  );
}
