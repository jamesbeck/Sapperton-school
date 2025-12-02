import Hero from "@/components/hero";
import HeadMessage from "@/components/headMessage";
import OpenDays from "@/components/openDays";
import LatestNews from "@/components/latestNews";
import Container from "@/components/container";
import H2 from "@/components/ui/h2";
import ClassEvents from "@/components/classEvents";
import InstagramPreview from "@/components/instagramPreview";
import VideoSection from "@/components/videoSection";
import payload from "@/payload";

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

  // Fetch upcoming events
  const upcomingEvents = await payload.find({
    collection: "events",
    depth: 2,
    limit: 10,
    sort: "date",
    where: {
      date: {
        greater_than_equal: new Date().toISOString(),
      },
    },
  });

  return (
    <div>
      <Hero words={heroWords} openDays={openDaysResult.docs} />
      <HeadMessage headteacherWelcome={headteacherWelcome} />
      <VideoSection />
      <LatestNews newsArticles={latestNews.docs} />
      <Container colour="green">
        <div className="flex flex-col gap-8 items-center">
          <div className="flex flex-col gap-8">
            <H2>Upcoming Events</H2>
            <ClassEvents events={upcomingEvents.docs} />
          </div>
        </div>
      </Container>
      <InstagramPreview />
      <OpenDays openDays={openDaysResult.docs} />
    </div>
  );
}
