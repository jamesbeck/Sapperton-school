import Banner from "@/components/banner";
import Container from "@/components/container";
import { notFound } from "next/navigation";
import { Page, Media } from "@/payload-types";
import { RichText } from "@payloadcms/richtext-lexical/react";
import payload from "@/payload";

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

  return (
    <div>
      <Banner
        title={page.title || ""}
        url={banner?.url || ""}
        focalX={banner?.focalX || 0}
        focalY={banner?.focalY || 0}
      />
      <Container>
        <RichText data={page.body} className="page-content" />
      </Container>
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
