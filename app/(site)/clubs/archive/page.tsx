import type { Metadata } from "next";
import Link from "next/link";
import Banner from "@/components/banner";
import Breadcrumbs from "@/components/breadcrumbs";
import ClubCard from "@/components/clubCard";
import Container from "@/components/container";
import H1 from "@/components/ui/h1";
import payload from "@/payload";
import { getClubState } from "@/utils/clubBlocks";

export const revalidate = 30;
export const metadata: Metadata = {
  title: "Clubs through the year",
  description: "Discover clubs offered in past terms and at different times of the year at Sapperton School.",
  alternates: { canonical: "/clubs/archive" },
};

export default async function ClubArchivePage() {
  const clubs = await payload.find({
    collection: "clubs", depth: 1, pagination: false, sort: ["order", "name"],
  });
  const now = new Date();
  const archived = clubs.docs.filter((club) => getClubState(club.blocks, now) === "past");
  return (
    <div>
      <Banner url="/defaultBanner.jpg" focalX={50} focalY={40} />
      <Breadcrumbs crumbs={[
        { label: "Our Clubs", url: "/clubs" },
        { label: "Clubs through the year", url: "/clubs/archive" },
      ]} />
      <Container>
        <div className="flex flex-col gap-8">
          <H1>Clubs through the year</H1>
          <p className="mx-auto max-w-3xl text-center">
            Explore clubs we’ve offered in past terms and at different times of the year.
            Some return in the same term each year, while others vary as we introduce new activities.
            These clubs aren’t running at the moment; check our current and upcoming clubs for confirmed dates.
          </p>
          <Link href="/clubs" className="text-center underline underline-offset-4">View current and upcoming clubs</Link>
          {archived.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {archived.map((club) => <ClubCard club={club} key={club.id} />)}
            </div>
          ) : <p className="text-center">More clubs will appear here as the year’s activities come to an end.</p>}
        </div>
      </Container>
    </div>
  );
}
