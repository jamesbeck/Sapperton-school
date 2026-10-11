import type { Metadata } from "next";
import Banner from "@/components/banner";
import Breadcrumbs from "@/components/breadcrumbs";
import ClubCard from "@/components/clubCard";
import Container from "@/components/container";
import H1 from "@/components/ui/h1";
import payload from "@/payload";

export const revalidate = 30;
export const metadata: Metadata = {
  title: "Our Clubs",
  description:
    "Explore Sapperton School clubs, meet the staff and find weekly session times.",
  alternates: { canonical: "/clubs" },
};

export default async function ClubsPage() {
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
            <div className="flex flex-wrap gap-12 justify-center">
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
    </div>
  );
}
