import Link from "next/link";
import { getClubState } from "@/utils/clubBlocks";
import type { Metadata } from "next";
import Banner from "@/components/banner";
import Breadcrumbs from "@/components/breadcrumbs";
import ClubCard from "@/components/clubCard";
import Container from "@/components/container";
import H1 from "@/components/ui/h1";
import H2 from "@/components/ui/h2";
import payload from "@/payload";

export const revalidate = 3600;
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
  const now = new Date();
  const current = clubs.docs.filter((club) => getClubState(club.blocks, now) === "current");
  const upcoming = clubs.docs.filter((club) => getClubState(club.blocks, now) === "upcoming");
  const hasArchive = clubs.docs.some((club) => getClubState(club.blocks, now) === "past");
  return (
    <div>
      <Banner url="/defaultBanner.jpg" focalX={50} focalY={40} />
      <Breadcrumbs crumbs={[{ label: "Our Clubs", url: "/clubs" }]} />
      <Container>
        <div className="flex flex-col gap-8">
          <H1>Our Clubs</H1>
          <H2>Current clubs</H2>
          {current.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {current.map((club) => (
                <ClubCard club={club} key={club.id} />
              ))}
            </div>
          ) : (
            <p className="text-center">
              {upcoming.length > 0
                ? "No clubs are running at the moment. Explore our confirmed upcoming clubs below."
                : "Details of the next clubs will be confirmed soon."}
            </p>
          )}
          {upcoming.length > 0 && (
            <section className="flex flex-col gap-6">
              <H2>Upcoming clubs</H2>
              <p className="text-center">Confirmed activities starting soon.</p>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {upcoming.map((club) => <ClubCard club={club} key={club.id} />)}
              </div>
            </section>
          )}
          {hasArchive && (
            <div className="rounded-xl bg-sapperton-green/5 p-6 text-center">
              <p>Our clubs change with the seasons. Discover activities offered in past terms and at other times of the year.</p>
              <Link href="/clubs/archive" className="mt-2 inline-block underline underline-offset-4">
                Explore our clubs through the year
              </Link>
            </div>
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
