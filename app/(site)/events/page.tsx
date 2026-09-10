import Banner from "@/components/banner";
import Container from "@/components/container";
import Breadcrumbs from "@/components/breadcrumbs";
import H1 from "@/components/ui/h1";
import EventsCalendar from "@/components/eventsCalendar";
import payload from "@/payload";

export const revalidate = 30;

export default async function EventsPage() {
  const eventsResult = await payload.find({
    collection: "events",
    depth: 2,
    pagination: false,
    sort: "date",
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
              No events scheduled. Check back soon!
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}
