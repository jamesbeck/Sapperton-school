import type { Metadata } from "next";
import Banner from "@/components/banner";
import Breadcrumbs from "@/components/breadcrumbs";
import ClubCard from "@/components/clubCard";
import Container from "@/components/container";
import H1 from "@/components/ui/h1";
import H2 from "@/components/ui/h2";
import payload from "@/payload";

export const revalidate = 30;
export const metadata: Metadata = {
  title: "Our Clubs",
  description:
    "Explore Sapperton School clubs, meet the staff and find weekly session times.",
  alternates: { canonical: "/clubs" },
};

export default async function ClubsPage() {
  const information = await payload.findGlobal({ slug: "clubInformation" });
  const clubs = await payload.find({
    collection: "clubs",
    depth: 1,
    pagination: false,
    sort: ["order", "name"],
  });
  return (
    <div>
      <Banner url="/defaultBanner.jpg" focalX={50} focalY={40} />
      <Breadcrumbs crumbs={[{ label: "Our Clubs", url: "/clubs" }]} />
      <Container>
        <div className="flex flex-col gap-8">
          <H1>Our Clubs</H1>
          {clubs.docs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {clubs.docs.map((club) => (
                <ClubCard club={club} key={club.id} />
              ))}
            </div>
          ) : (
            <p className="text-center">
              Details of our clubs will be available soon.
            </p>
          )}
        </div>
      </Container>
      {(information.bookingPolicy || information.paymentPlanEmail) && (
        <Container colour="green" id="booking-information">
          <div className="max-w-3xl mx-auto flex flex-col gap-5">
            <H2 className="text-white">Booking information</H2>
            {information.bookingPolicy && (
              <p className="whitespace-pre-line">{information.bookingPolicy}</p>
            )}
            {information.paymentPlanEmail && (
              <p>
                For help with a payment plan when booking multiple activity
                clubs, please contact{" "}
                <a
                  className="underline underline-offset-4"
                  href={`mailto:${information.paymentPlanEmail}`}
                >
                  {information.paymentPlanEmail}
                </a>
                .
              </p>
            )}
          </div>
        </Container>
      )}
    </div>
  );
}
