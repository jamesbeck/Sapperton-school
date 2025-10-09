import Banner from "@/components/banner";
import Container from "@/components/container";
import payload from "@/payload";
import Breadcrumbs from "@/components/breadcrumbs";
import H2 from "@/components/ui/h2";
import { Staff, Media } from "@/payload-types";
import StaffCard from "@/components/staffCard";
import NewsCard from "@/components/newsCard";
import { RichText } from "@payloadcms/richtext-lexical/react";
import H1 from "@/components/ui/h1";

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

  return (
    <div>
      <Banner
        url={image?.url || ""}
        focalX={image?.focalX || 50}
        focalY={image?.focalY || 30}
      />

      <Breadcrumbs
        crumbs={[
          { label: "Classes", url: "/classes" },
          { label: schoolClass.name, url: `/classes/${slug}` },
        ]}
      />

      <Container>
        <div className="flex flex-col space-y-8">
          <H1>{schoolClass.name}</H1>
          <div>
            <H2>About {schoolClass.name}</H2>
            <RichText data={schoolClass.description} className="text-center" />
          </div>

          <div className="flex flex-col gap-8 items-center">
            {!!schoolClass.primaryTeachers?.length && (
              <>
                <H2>Class Teachers</H2>
                <div className="flex flex-wrap gap-12">
                  {schoolClass.primaryTeachers?.map((staff, i) => (
                    <StaffCard staff={staff as Staff} key={i} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-8 items-center">
            {!!schoolClass.otherTeachers?.length && (
              <>
                <H2>Teaching Assistants</H2>
                <div className="flex flex-wrap gap-12">
                  {schoolClass.otherTeachers?.map((staff, i) => (
                    <StaffCard staff={staff as Staff} key={i} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-8">
            <H2>News Articles</H2>
            {newsArticles.docs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsArticles.docs.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">
                No news articles for this class yet.
              </p>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
