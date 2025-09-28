import { getPayload } from "payload";
import configPromise from "@payload-config";
import Banner from "@/components/banner";
import Container from "@/components/container";

export default async function TermDates() {
  const payload = await getPayload({ config: configPromise });

  const events = await payload.find({
    collection: "events",
    where: {
      type: {
        equals: "term-date",
      },
    },
    sort: "startDate:asc",
    // id: "507f1f77bcf86cd799439011",
  });

  return (
    <div>
      <Banner />
      <Container>
        <h1>Term Dates</h1>
        {events.docs.map((event) => (
          <div key={event.id}>{event.name}</div>
        ))}
      </Container>
    </div>
  );
}
