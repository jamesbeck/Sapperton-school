import Banner from "@/components/banner";
import Container from "@/components/container";
import { notFound } from "next/navigation";
import { Page, Media } from "@/payload-types";
import { RichText } from "@payloadcms/richtext-lexical/react";
import payload from "@/payload";
import H1 from "@/components/ui/h1";
import Breadcrumbs from "@/components/breadcrumbs";
import H2 from "@/components/ui/h2";
import ImageGallery from "@/components/imageGallery";
import { FileIcon } from "lucide-react";
import Link from "next/link";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

  //final slug
  const finalSlug = slug[slug.length - 1];

  const menuItems = await payload.find({
    collection: "menuItems",
    where: {
      slug: {
        equals: finalSlug,
      },
    },
    depth: 2,
    // id: "507f1f77bcf86cd799439011",
  });

  if (!menuItems.docs?.[0]?.page) {
    return notFound();
  }

  const page = menuItems.docs[0].page as Page;
  const banner = page.banner as Media;

  const galleryImages = page.galleryImages?.map((image) => {
    return {
      // @ts-expect-error image will always have url property
      original: image.url,
      // @ts-expect-error image will always have url property
      thumbnail: image.url,
    };
  }) as { original: string; thumbnail: string }[];

  return (
    <div>
      <Banner
        url={banner?.url || ""}
        focalX={banner?.focalX || 0}
        focalY={banner?.focalY || 0}
      />
      <Breadcrumbs crumbs={menuItems.docs[0].breadcrumbs || []} />
      <Container>
        <div className="flex flex-col gap-8">
          <H1>{page.title}</H1>
          <RichText data={page.body} className="page-content" />
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
      {!!page.files?.length && (
        <Container>
          <div className="flex flex-col gap-8">
            <H2>File Downloads</H2>
            <div className="flex flex-col gap-4 max-w-lg mx-auto">
              {page.files?.map((file) => {
                const media = file as Media;
                return (
                  <div key={media.id} className="flex gap-4">
                    <Link href={media.url || ""} key={media.id} target="_blank">
                      <FileIcon className="w-12 h-12" />
                    </Link>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Link
                          href={media.url || ""}
                          key={media.id}
                          target="_blank"
                          className="flex items-center gap-2 hover:underline font-bold"
                        >
                          <span>{media.filename}</span>
                        </Link>
                        <span className="text-xs">
                          ({Math.round((media.filesize || 0) / 1024)} KB)
                        </span>
                      </div>
                      <span>{media.alt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      )}
    </div>
  );
}

export const generateStaticParams = async () => {
  const menuItems = await payload.find({
    collection: "menuItems",
    depth: 2,
    limit: 1000,
    where: {
      parent: { exists: true },
    },
  });

  return menuItems.docs.map((item) => {
    return {
      slug:
        item.breadcrumbs?.[item.breadcrumbs.length - 1].url
          ?.split("/")
          .filter(Boolean) || "",
    };
  });
};
