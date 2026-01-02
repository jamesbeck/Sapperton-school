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
import Link from "next/link";
import { FileIcon, defaultStyles } from "react-file-icon";
import { ImageIcon } from "lucide-react";

export const revalidate = 30;

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

  //final slug
  const finalSlug = slug[slug.length - 1];

  // Check main menu items first
  const menuItems = await payload.find({
    collection: "menuItems",
    where: {
      slug: {
        equals: finalSlug,
      },
    },
    depth: 2,
  });

  // If not found in main menu, check footer menu items
  let footerMenuItems = { docs: [] as typeof menuItems.docs };
  if (!menuItems.docs?.[0]?.page) {
    footerMenuItems = await payload.find({
      collection: "footerMenuItems",
      where: {
        slug: {
          equals: finalSlug,
        },
      },
      depth: 2,
    });
  }

  // Use whichever has a page
  const currentMenuItem = menuItems.docs?.[0]?.page
    ? menuItems.docs[0]
    : footerMenuItems.docs?.[0];

  const isFooterMenuItem =
    !menuItems.docs?.[0]?.page && footerMenuItems.docs?.[0]?.page;
  const collection = isFooterMenuItem ? "footerMenuItems" : "menuItems";

  if (!currentMenuItem?.page) {
    return notFound();
  }

  const page = currentMenuItem.page as Page;
  const banner = page.banner as Media;

  const galleryImages = page.galleryImages?.map((image) => {
    const media = image as Media;
    return {
      original: media.sizes?.small?.url || media.url || "",
      thumbnail: media.sizes?.thumbnail?.url || media.url || "",
    };
  }) as { original: string; thumbnail: string }[];

  // Fetch sibling pages
  let siblingPages: typeof menuItems.docs = [];
  let parentName = "";

  if (currentMenuItem.parent) {
    const parentId =
      typeof currentMenuItem.parent === "number"
        ? currentMenuItem.parent
        : currentMenuItem.parent.id;

    const parent =
      typeof currentMenuItem.parent === "number"
        ? await payload.findByID({
            collection: collection,
            id: parentId,
          })
        : currentMenuItem.parent;

    parentName = parent.title;

    const siblings = await payload.find({
      collection: collection,
      where: {
        parent: {
          equals: parentId,
        },
        id: {
          not_equals: currentMenuItem.id,
        },
      },
      depth: 2,
      sort: "order",
      limit: 1000,
    });

    siblingPages = siblings.docs.filter((item) => item.page);
  }

  return (
    <div>
      <Banner
        url={banner?.url || ""}
        focalX={banner?.focalX || 0}
        focalY={banner?.focalY || 0}
      />
      <Breadcrumbs crumbs={currentMenuItem.breadcrumbs || []} />
      <Container>
        <div className="flex flex-col gap-8">
          <H1>{page.title}</H1>
          <RichText data={page.body} className="page-content" />
        </div>
      </Container>
      {galleryImages?.length > 0 && (
        <Container colour="green">
          <div className="flex flex-col gap-8">
            <H2 className="text-white">Gallery</H2>
            <ImageGallery images={galleryImages || []} />
          </div>
        </Container>
      )}
      {!!page.files?.length && (
        <Container colour="green">
          <div className="flex flex-col gap-8">
            <H2 className="text-white">File Downloads</H2>
            <div className="flex flex-col gap-3 max-w-3xl mx-auto">
              {page.files?.map((file) => {
                const media = file as Media;
                const extension =
                  media.filename?.split(".").pop()?.toLowerCase() || "";
                return (
                  <Link
                    key={media.id}
                    href={media.url || ""}
                    target="_blank"
                    className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-sapperton-green"
                  >
                    <div className="flex-shrink-0 w-12 h-12">
                      <FileIcon
                        extension={extension}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        {...(defaultStyles as any)[extension]}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 group-hover:text-sapperton-green transition-colors truncate">
                        {media.filename}
                      </div>
                      {media.alt && (
                        <div className="text-sm text-gray-600 line-clamp-1">
                          {media.alt}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                      {Math.round((media.filesize || 0) / 1024)} KB
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Container>
      )}
      {siblingPages.length > 0 && (
        <Container
          colour={
            galleryImages?.length > 0 && page.files?.length
              ? "green"
              : galleryImages?.length > 0 || page.files?.length
                ? "white"
                : "green"
          }
        >
          <div className="flex flex-col gap-8">
            <H2
              className={
                galleryImages?.length > 0 && page.files?.length
                  ? "text-white"
                  : galleryImages?.length > 0 || page.files?.length
                    ? ""
                    : "text-white"
              }
            >
              More from {parentName}
            </H2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {siblingPages.map((sibling) => {
                const siblingPage = sibling.page as Page;
                const siblingBanner = siblingPage.banner as Media;
                return (
                  <Link
                    key={sibling.id}
                    href={
                      sibling.breadcrumbs?.[sibling.breadcrumbs.length - 1]
                        ?.url || "#"
                    }
                    className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                      {siblingBanner?.url ? (
                        <img
                          src={
                            siblingBanner.sizes?.thumbnail?.url ||
                            siblingBanner.url ||
                            ""
                          }
                          alt={siblingBanner.alt || ""}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <ImageIcon className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <span className="font-semibold group-hover:underline">
                      {siblingPage.title}
                    </span>
                  </Link>
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
      url: { exists: false },
    },
  });

  const footerMenuItems = await payload.find({
    collection: "footerMenuItems",
    depth: 2,
    limit: 1000,
    where: {
      parent: { exists: true },
      url: { exists: false },
    },
  });

  const allItems = [...menuItems.docs, ...footerMenuItems.docs];

  return allItems.map((item) => {
    return {
      slug:
        item.breadcrumbs?.[item.breadcrumbs.length - 1].url
          ?.split("/")
          .filter(Boolean) || "",
    };
  });
};
