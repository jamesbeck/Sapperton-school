import Banner from "@/components/banner";
import Container from "@/components/container";
import Breadcrumbs from "@/components/breadcrumbs";
import H1 from "@/components/ui/h1";
import EventsCalendar from "@/components/eventsCalendar";
import payload from "@/payload";

export default async function EventsPage() {
  const eventsResult = await payload.find({
    collection: "events",
    depth: 2,
    limit: 1000,
    sort: "date",
    where: {
      date: {
        greater_than_equal: new Date().toISOString(),
      },
    },
  });

  return (
    <div>
      <Banner url={"/defaultBanner.jpg"} focalX={50} focalY={40} />
      <Breadcrumbs crumbs={[{ label: "Events", url: "/events" }]} />

      <Container>
        <div className="flex flex-col gap-12">
          <H1>School Calendar</H1>

          {eventsResult.docs.length > 0 ? (
            <EventsCalendar events={eventsResult.docs} />
          ) : (
            <p className="text-center text-gray-600">
              No upcoming events scheduled. Check back soon!
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}
