import Banner from "@/components/banner";
import Container from "@/components/container";
import payload from "@/payload";
import Breadcrumbs from "@/components/breadcrumbs";
import H2 from "@/components/ui/h2";
import { Staff, Media } from "@/payload-types";
import StaffCard from "@/components/staffCard";
import NewsCard from "@/components/newsCard";
import ClassEvents from "@/components/classEvents";
import { RichText } from "@payloadcms/richtext-lexical/react";
import H1 from "@/components/ui/h1";
import Link from "next/link";
import ImageGallery from "@/components/imageGallery";
import {
  FileIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  ImageIcon,
  VideoIcon,
  MusicIcon,
} from "lucide-react";

export const revalidate = 30;

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return FileTextIcon;
    case "doc":
    case "docx":
      return FileTextIcon;
    case "xls":
    case "xlsx":
    case "csv":
      return FileSpreadsheetIcon;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
      return ImageIcon;
    case "mp4":
    case "mov":
    case "avi":
    case "webm":
      return VideoIcon;
    case "mp3":
    case "wav":
    case "ogg":
      return MusicIcon;
    default:
      return FileIcon;
  }
}

export default async function StaffPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const schoolClasses = await payload.find({
    collection: "classes",
    depth: 2,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  const schoolClass = schoolClasses.docs?.[0];
  const image = schoolClass?.image as Media;
  const banner = schoolClass?.banner as Media;

  const galleryImages = schoolClass.galleryImages?.map((image) => {
    const media = image as Media;
    return {
      original: media.sizes?.small?.url || media.url || "",
      thumbnail: media.sizes?.thumbnail?.url || media.url || "",
    };
  }) as { original: string; thumbnail: string }[];

  // Fetch news articles for this class
  const newsArticles = await payload.find({
    collection: "newsArticles",
    depth: 2,
    limit: 6,
    sort: "-date",
    where: {
      classes: {
        equals: schoolClass.id,
      },
    },
  });

  // Fetch upcoming events for this class
  const classEvents = await payload.find({
    collection: "events",
    depth: 2,
    limit: 10,
    sort: "date",
    where: {
      and: [
        {
          classes: {
            equals: schoolClass.id,
          },
        },
        {
          date: {
            greater_than_equal: new Date().toISOString(),
          },
        },
      ],
    },
  });

  const allTeachers = [
    ...(schoolClass?.primaryTeachers || []),
    ...(schoolClass?.otherTeachers || []),
  ];

  return (
    <div>
      <Banner
        url={banner?.url || ""}
        focalX={banner?.focalX || 50}
        focalY={banner?.focalY || 30}
      />

      <Breadcrumbs
        crumbs={[
          { label: "Classes", url: "/classes" },
          { label: schoolClass.name, url: `/classes/${slug}` },
        ]}
      />

      <Container>
        <div className="flex flex-col gap-8">
          <H1>{schoolClass.name}</H1>
          <div>
            <RichText
              data={schoolClass.description}
              className="page-content text-center"
            />
          </div>
        </div>
      </Container>

      <Container colour="green">
        <div className="flex flex-col gap-8 items-center">
          {!!schoolClass.primaryTeachers?.length && (
            <>
              <H2 className="text-white">{schoolClass.name} Team</H2>
              <div className="flex flex-wrap justify-center gap-12">
                {allTeachers?.map((staff, i) => (
                  <StaffCard staff={staff as Staff} key={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </Container>

      <Container>
        <div className="flex flex-col gap-8 items-center">
          <div className="flex flex-col gap-8">
            <H2>Upcoming Events</H2>
            <ClassEvents events={classEvents.docs} />
          </div>
        </div>
      </Container>

      <Container colour="green">
        <div className="flex flex-col gap-8 items-center">
          <div className="flex flex-col gap-8">
            <H2 className="text-white">News Articles</H2>
            {newsArticles.docs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsArticles.docs.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    bgColor="green"
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-white/90">
                No news articles for this class yet.
              </p>
            )}
          </div>
        </div>
      </Container>

      {galleryImages?.length > 0 && (
        <Container>
          <div className="flex flex-col gap-8">
            <H2>Gallery</H2>
            <ImageGallery images={galleryImages || []} />
          </div>
        </Container>
      )}
      {!!schoolClass.files?.length && (
        <Container>
          <div className="flex flex-col gap-8">
            <H2>File Downloads</H2>
            <div className="flex flex-col gap-4 max-w-lg mx-auto">
              {schoolClass.files?.map((file) => {
                const media = file as Media;
                const Icon = getFileIcon(media.filename || "");
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
    </div>
  );
}
