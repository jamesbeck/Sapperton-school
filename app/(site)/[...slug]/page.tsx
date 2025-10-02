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
import { FileIcon, FileTextIcon, FileSpreadsheetIcon, ImageIcon, VideoIcon, MusicIcon } from "lucide-react";
import Link from "next/link";

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return FileTextIcon;
    case 'doc':
    case 'docx':
      return FileTextIcon;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return FileSpreadsheetIcon;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
      return ImageIcon;
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm':
      return VideoIcon;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return MusicIcon;
    default:
      return FileIcon;
  }
}

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

  const currentMenuItem = menuItems.docs[0];
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
    const parentId = typeof currentMenuItem.parent === 'number'
      ? currentMenuItem.parent
      : currentMenuItem.parent.id;

    const parent = typeof currentMenuItem.parent === 'number'
      ? await payload.findByID({
          collection: "menuItems",
          id: parentId,
        })
      : currentMenuItem.parent;

    parentName = parent.title;

    const siblings = await payload.find({
      collection: "menuItems",
      where: {
        parent: {
          equals: parentId,
        },
        id: {
          not_equals: currentMenuItem.id,
        },
      },
      depth: 2,
      sort: 'order',
    });

    siblingPages = siblings.docs.filter(item => item.page);
  }

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
                const Icon = getFileIcon(media.filename || '');
                return (
                  <div key={media.id} className="flex gap-4">
                    <Link href={media.url || ""} key={media.id} target="_blank">
                      <Icon className="w-12 h-12" />
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
      {siblingPages.length > 0 && (
        <Container colour={
          (galleryImages?.length > 0 && page.files?.length) ? "green" :
          (galleryImages?.length > 0 || page.files?.length) ? "white" :
          "green"
        }>
          <div className="flex flex-col gap-8">
            <H2>More from {parentName}</H2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {siblingPages.map((sibling) => {
                const siblingPage = sibling.page as Page;
                const siblingBanner = siblingPage.banner as Media;
                return (
                  <Link
                    key={sibling.id}
                    href={sibling.breadcrumbs?.[sibling.breadcrumbs.length - 1]?.url || "#"}
                    className="group flex flex-col gap-4 hover:opacity-80 transition-opacity"
                  >
                    {siblingBanner?.url && (
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
                        <img
                          src={siblingBanner.sizes?.small?.url || siblingBanner.url || ""}
                          alt={siblingBanner.alt || ""}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold group-hover:underline">
                      {siblingPage.title}
                    </h3>
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

  return menuItems.docs.map((item) => {
    return {
      slug:
        item.breadcrumbs?.[item.breadcrumbs.length - 1].url
          ?.split("/")
          .filter(Boolean) || "",
    };
  });
};
