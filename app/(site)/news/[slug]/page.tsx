import Banner from "@/components/banner";
import Container from "@/components/container";
import { notFound } from "next/navigation";
import { Media, Staff } from "@/payload-types";
import { RichText } from "@payloadcms/richtext-lexical/react";
import payload from "@/payload";
import H1 from "@/components/ui/h1";
import Breadcrumbs from "@/components/breadcrumbs";
import H2 from "@/components/ui/h2";
import ImageGallery from "@/components/imageGallery";
import StaffCard from "@/components/staffCard";

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const articles = await payload.find({
    collection: "newsArticles",
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 2,
  });

  if (!articles.docs?.[0]) {
    return notFound();
  }

  const article = articles.docs[0];
  const banner = article.banner as Media;
  const author = article.author as Staff;

  const galleryImages = article.gallery?.map((image) => {
    const media = image as Media;
    return {
      original: media.sizes?.small?.url || media.url || "",
      thumbnail: media.sizes?.thumbnail?.url || media.url || "",
    };
  }) as { original: string; thumbnail: string }[];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      <Banner
        url={banner?.url || ""}
        focalX={banner?.focalX || 0}
        focalY={banner?.focalY || 0}
      />
      <Breadcrumbs
        crumbs={[
          { label: "News", url: "/news" },
          { label: article.headline, url: `/news/${slug}` },
        ]}
      />
      <Container>
        <div className="flex flex-col gap-8">
          <H1>{article.headline}</H1>
          <p className="text-center text-gray-600 text-lg">
            {formatDate(article.date)}
          </p>
          {author && (
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-gray-600">Written by</p>
                <StaffCard staff={author} />
              </div>
            </div>
          )}
          <RichText data={article.body} className="page-content" />
        </div>
      </Container>
      {galleryImages?.length > 0 && (
        <Container colour="green">
          <div className="flex flex-col gap-8">
            <H2>Gallery</H2>
            <ImageGallery images={galleryImages || []} />
          </div>
        </Container>
      )}
    </div>
  );
}

export const generateStaticParams = async () => {
  const articles = await payload.find({
    collection: "newsArticles",
    limit: 1000,
  });

  return articles.docs.map((article) => ({
    slug: article.slug,
  }));
};
