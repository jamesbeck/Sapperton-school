import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Staff } from "@/payload-types";
import payload from "@/payload";
import Banner from "@/components/banner";
import Breadcrumbs from "@/components/breadcrumbs";
import Container from "@/components/container";
import H1 from "@/components/ui/h1";
import H2 from "@/components/ui/h2";
import StaffCard from "@/components/staffCard";
import NewsCard from "@/components/newsCard";
import ImageGallery from "@/components/imageGallery";
import ClubBlockDetails from "@/components/clubBlockDetails";
import { getBlockState } from "@/utils/clubBlocks";

export const revalidate = 30;
type Props = { params: Promise<{ slug: string }> };

const getClub = cache(async (slug: string) => {
  const results = await payload.find({
    collection: "clubs",
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
  });
  const club = results.docs[0];
  if (!club) notFound();
  return club;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const club = await getClub((await params).slug);
  return {
    title: club.name,
    description: `Find out about ${club.name} at Sapperton School, including weekly sessions, staff, photos and news.`,
    alternates: { canonical: `/clubs/${club.slug}` },
  };
}

export default async function ClubPage({ params }: Props) {
  const club = await getClub((await params).slug);
  const banner = typeof club.banner === "object" ? club.banner : null;
  const blocks = [...(club.blocks || [])].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );
  const activeBlocks = blocks.filter(
    (block) => getBlockState(block) !== "past",
  );
  const pastBlocks = blocks
    .filter((block) => getBlockState(block) === "past")
    .reverse();
  const staff = [...(club.teachers || []), ...(club.otherTeachers || [])]
    .filter(
      (person): person is Staff =>
        typeof person === "object" && person !== null,
    )
    .filter(
      (person, index, people) =>
        people.findIndex(({ id }) => id === person.id) === index,
    );
  const gallery = (club.galleryImages || []).flatMap((image) => {
    if (typeof image !== "object" || !image?.url) return [];
    return [
      {
        original: image.sizes?.small?.url || image.url,
        thumbnail: image.sizes?.thumbnail?.url || image.url,
        originalAlt: image.alt || `${club.name} photo`,
        thumbnailAlt: image.alt || `${club.name} photo`,
      },
    ];
  });
  const news = await payload.find({
    collection: "newsArticles",
    depth: 1,
    limit: 6,
    sort: "-date",
    where: { clubs: { equals: club.id } },
  });

  return (
    <div>
      <Banner
        url={banner?.url || "/defaultBanner.jpg"}
        focalX={banner?.focalX ?? 50}
        focalY={banner?.focalY ?? 40}
      />
      <Breadcrumbs
        crumbs={[
          { label: "Our Clubs", url: "/clubs" },
          { label: club.name, url: `/clubs/${club.slug}` },
        ]}
      />
      <Container>
        <div className="flex flex-col gap-8">
          <H1>{club.name}</H1>
          <p className="text-center">{club.years}</p>
          {club.description && (
            <RichText
              data={club.description}
              className="page-content text-center"
            />
          )}
          {activeBlocks.map((block) => (
            <ClubBlockDetails key={block.id} block={block} />
          ))}
          {!blocks.length && (
            <p className="text-center">Term details will be confirmed soon.</p>
          )}
          {pastBlocks.length > 0 && (
            <details className="rounded-xl border border-sapperton-green/20 p-6">
              <summary className="cursor-pointer font-semibold">
                Previous term blocks ({pastBlocks.length})
              </summary>
              <div className="mt-6 flex flex-col gap-6">
                {pastBlocks.map((block) => (
                  <ClubBlockDetails key={block.id} block={block} />
                ))}
              </div>
            </details>
          )}
        </div>
      </Container>
      {staff.length > 0 && (
        <Container colour="green">
          <div className="flex flex-col gap-8 items-center">
            <H2 className="text-white">{club.name} Team</H2>
            <div className="flex flex-wrap justify-center gap-12">
              {staff.map((person) => (
                <StaffCard staff={person} key={person.id} />
              ))}
            </div>
          </div>
        </Container>
      )}
      {gallery.length > 0 && (
        <Container>
          <div className="flex flex-col gap-8">
            <H2>Gallery</H2>
            <ImageGallery images={gallery} />
          </div>
        </Container>
      )}
      <Container colour="green">
        <div className="flex flex-col gap-8">
          <H2 className="text-white">Club News</H2>
          {news.docs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.docs.map((article) => (
                <NewsCard article={article} bgColor="green" key={article.id} />
              ))}
            </div>
          ) : (
            <p className="text-center">No news articles for this club yet.</p>
          )}
        </div>
      </Container>
    </div>
  );
}
