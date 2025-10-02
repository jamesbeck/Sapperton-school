"use client";
import Container from "@/components/container";
import { bodoniModa } from "../fonts";
import { AnimateIn } from "@/utils/animateIn";
import { Event } from "@/payload-types";
import { CalendarDays, Phone, Mail } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";

export default function OpenDays({ openDays }: { openDays: Event[] }) {
  if (openDays.length === 0) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container colour="green">
      <div className="flex flex-col gap-12">
        <AnimateIn>
          <div className="text-center">
            <h2
              className={`text-4xl md:text-6xl tracking-tighter ${bodoniModa.className} mb-6 text-balance leading-tight`}
            >
              Come and Visit Us
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto text-balance">
              We&apos;d love to welcome you to Sapperton School. Join us for an Open
              Day to see our wonderful school in action, meet our staff and
              students, and discover what makes our community special.
            </p>
          </div>
        </AnimateIn>

        <AnimateIn>
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            {openDays.map((event) => (
              <div
                key={event.id}
                className="bg-white text-sapperton-green rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-3 mb-4">
                  <CalendarDays className="w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{event.name}</h3>
                    <p className="text-lg">{formatDate(event.date)}</p>
                    {event.endDate && (
                      <p className="text-sm text-sapperton-green/70">
                        Until {formatDate(event.endDate)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sapperton-green/80 prose prose-sm max-w-none">
                  <RichText data={event.description} />
                </div>
              </div>
            ))}
          </div>
        </AnimateIn>

        <AnimateIn>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Book Your Visit or Just Turn Up
            </h3>
            <p className="text-lg mb-6 text-white/90">
              No appointment necessary - feel free to drop in! Or if you&apos;d
              prefer to let us know you&apos;re coming, get in touch:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:01285760325"
                className="flex items-center gap-2 bg-white text-sapperton-green px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                <Phone className="w-5 h-5" />
                01285 760325
              </a>
              <a
                href="mailto:admin@sapperton.gloucs.sch.uk"
                className="flex items-center gap-2 bg-white text-sapperton-green px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                <Mail className="w-5 h-5" />
                admin@sapperton.gloucs.sch.uk
              </a>
            </div>
          </div>
        </AnimateIn>
      </div>
    </Container>
  );
}
