import Hero from "@/components/hero";
import HeadMessage from "@/components/headMessage";
import ExecHeadQuote from "@/components/execHeadQuote";
import OpenDays from "@/components/openDays";
import LatestNews from "@/components/latestNews";
import Container from "@/components/container";
import H2 from "@/components/ui/h2";
import ClassEvents from "@/components/classEvents";
import InstagramPreview from "@/components/instagramPreview";
import VideoSection from "@/components/videoSection";
import payload from "@/payload";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

export const revalidate = 30;

export default async function Home({}) {
  //get headteacher global

  const headteacherWelcome = await payload.findGlobal({
    slug: "headteacher-welcome",
    depth: 2,
  });

  const heroWords = await payload.findGlobal({
    slug: "hero-words",
  });

  // Fetch upcoming Open Day events
  const openDaysResult = await payload.find({
    collection: "events",
    where: {
      type: {
        equals: "open-day",
      },
      date: {
        greater_than_equal: new Date().toISOString(),
      },
    },
    sort: "date",
    limit: 10,
  });

  // Fetch latest news articles
  const latestNews = await payload.find({
    collection: "newsArticles",
    sort: "-date",
    limit: 3,
    depth: 2,
  });

  // Fetch upcoming events (next 7 days only)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingEvents = await payload.find({
    collection: "events",
    depth: 2,
    limit: 10,
    sort: "date",
    where: {
      and: [
        {
          date: {
            greater_than_equal: new Date().toISOString(),
          },
        },
        {
          date: {
            less_than_equal: sevenDaysFromNow.toISOString(),
          },
        },
      ],
    },
  });

  return (
    <div>
      <Hero words={heroWords} openDays={openDaysResult.docs} />
      <HeadMessage headteacherWelcome={headteacherWelcome} />
      <ExecHeadQuote />
      <VideoSection />
      <LatestNews newsArticles={latestNews.docs} />
      <Container colour="green">
        <div className="flex flex-col gap-8 items-center">
          <div className="flex flex-col gap-8">
            <H2 className="text-white">Upcoming Events</H2>
            {upcomingEvents.docs.length > 0 ? (
              <ClassEvents events={upcomingEvents.docs} />
            ) : (
              <p className="text-white/80 text-center">
                No events scheduled in the next 7 days.
              </p>
            )}
            <div className="flex justify-center">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-sapperton-green rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                <CalendarDays className="w-5 h-5" />
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
