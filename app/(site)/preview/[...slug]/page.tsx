import { getPayload } from "payload";
import configPromise from "@payload-config";
import Banner from "@/components/banner";
import Container from "@/components/container";
import { RefreshRouteOnSave } from "@/utils/refreshRouteOnSave";
import { notFound } from "next/navigation";
import { Page, Media } from "@/payload-types";
import { RichText } from "@payloadcms/richtext-lexical/react";

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key: string }>;
}) {
  const slug = (await params).slug;
  const previewKey = (await searchParams).key;

  if (previewKey !== process.env.PREVIEW_KEY) {
    return notFound();
  }

  //final slug
  const finalSlug = slug[slug.length - 1];

  const payload = await getPayload({ config: configPromise });

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

  const pageVersion = await payload.findVersions({
    collection: "pages",
    limit: 1,
    page: 1,
    depth: 2,
    where: {
      parent: {
        equals: (menuItems.docs[0].page as Page)?.id,
      },
    },
    sort: "-createdAt",
    draft: true,
  });

  if (!pageVersion.docs?.[0]) {
    return notFound();
  }

  const page = pageVersion.docs[0].version as Page;
  const banner = page.banner as Media;

  return (
    <div>
      <RefreshRouteOnSave />
      <div className="fixed -rotate-45 top-24 left-8 text-5xl z-100 text-red-500/70 font-bold">
        Preview
      </div>
      <Banner
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
