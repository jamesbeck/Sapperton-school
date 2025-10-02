import Hero from "@/components/hero";
import HeadMessage from "@/components/headMessage";
import OpenDays from "@/components/openDays";
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

  return (
    <div>
      <Hero words={heroWords} />
      <HeadMessage headteacherWelcome={headteacherWelcome} />
      <OpenDays openDays={openDaysResult.docs} />
    </div>
  );
}
