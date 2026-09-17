import AdmissionsPopup from "@/components/admissionsPopup";
import BookAVisit from "@/components/bookAVisit";
import ClassEvents from "@/components/classEvents";
import Container from "@/components/container";
import HeadMessage from "@/components/headMessage";
import Hero from "@/components/hero";
import InstagramPreview from "@/components/instagramPreview";
import LatestNews from "@/components/latestNews";
import OpenDays from "@/components/openDays";
import H2 from "@/components/ui/h2";
import VideoSection from "@/components/videoSection";
import payload from "@/payload";
import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Sapperton School Assistant Preview",
  description: "Private preview of the Sapperton School assistant experience.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AssistantPreviewPage() {
  const headteacherWelcome = await payload.findGlobal({
    slug: "headteacher-welcome",
    depth: 2,
  });

  const helenCooperResult = await payload.find({
    collection: "staff",
    where: {
      slug: { equals: "mrs-helen-cooper" },
    },
    depth: 2,
    limit: 1,
  });

  const heroWords = await payload.findGlobal({
    slug: "hero-words",
  });

  const openDaysResult = await payload.find({
    collection: "events",
    where: {
      type: { equals: "open-day" },
      date: { greater_than_equal: new Date().toISOString() },
    },
    sort: "date",
    pagination: false,
  });

  const latestNews = await payload.find({
    collection: "newsArticles",
    sort: "-date",
    limit: 3,
    depth: 2,
  });

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingEvents = await payload.find({
    collection: "events",
    depth: 2,
    limit: 10,
    sort: "date",
    where: {
      and: [
        { date: { greater_than_equal: new Date().toISOString() } },
        { date: { less_than_equal: sevenDaysFromNow.toISOString() } },
      ],
    },
  });

  return (
    <div>
      <AdmissionsPopup />
      <Hero
        words={heroWords}
        openDays={openDaysResult.docs}
        scrollTarget="head-message"
      />
      <HeadMessage
        headteacherWelcome={headteacherWelcome}
        helenCooper={helenCooperResult.docs[0] ?? null}
      />
      <BookAVisit />
      <VideoSection />
      <LatestNews newsArticles={latestNews.docs} />
      <Container colour="green">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col gap-8">
            <H2 className="text-white">Upcoming Events</H2>
            {upcomingEvents.docs.length > 0 ? (
              <ClassEvents events={upcomingEvents.docs} />
            ) : (
              <p className="text-center text-white/80">
                No events scheduled in the next 7 days.
              </p>
            )}
            <div className="flex justify-center">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-sapperton-green transition-colors hover:bg-white/90"
              >
                <CalendarDays className="h-5 w-5" />
                View Full Calendar
              </Link>
            </div>
          </div>
        </div>
      </Container>
      <InstagramPreview />
      <OpenDays openDays={openDaysResult.docs} />
    </div>
  );
}
