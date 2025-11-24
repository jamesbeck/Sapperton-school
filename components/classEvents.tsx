"use client";
import { Event } from "@/payload-types";
import EventCard from "@/components/eventCard";
import Link from "next/link";
import { Calendar } from "lucide-react";

export default function ClassEvents({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No upcoming events for this class.</p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sapperton-green hover:underline font-semibold"
        >
          <Calendar className="w-4 h-4" />
          View full school calendar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <div className="text-center pt-4 border-t border-gray-200">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sapperton-green hover:underline font-semibold"
        >
          <Calendar className="w-5 h-5" />
          View full school calendar
        </Link>
      </div>
    </div>
  );
}
