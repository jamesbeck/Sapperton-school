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
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

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

  if (!menuItems.docs?.[0]?.Page) {
    return notFound();
  }

  const page = menuItems.docs[0].Page as Page;
  const banner = page.banner as Media;

  console.log(banner, "banner");

  return (
    <div>
      <RefreshRouteOnSave />
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
