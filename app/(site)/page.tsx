import Hero from "@/components/hero";
import HeadMessage from "@/components/headMessage";
import OpenDays from "@/components/openDays";
import LatestNews from "@/components/latestNews";
import payload from "@/payload";

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

  return (
    <div>
      <Hero words={heroWords} />
      <HeadMessage headteacherWelcome={headteacherWelcome} />
      <LatestNews newsArticles={latestNews.docs} />
      <OpenDays openDays={openDaysResult.docs} />
    </div>
  );
}
