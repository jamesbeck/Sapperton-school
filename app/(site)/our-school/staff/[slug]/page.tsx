import Banner from "@/components/banner";
import Container from "@/components/container";
import payload from "@/payload";
import { Media } from "@/payload-types";
import Breadcrumbs from "@/components/breadcrumbs";
import H2 from "@/components/ui/h2";
import { RichText } from "@payloadcms/richtext-lexical/react";
import ClassCard from "@/components/classCard";
import H1 from "@/components/ui/h1";

export default async function StaffPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const staff = await payload.find({
    collection: "staff",
    depth: 2,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  const image = staff.docs?.[0].image as Media;

  const classesTaught = await payload.find({
    collection: "classes",
    depth: 2,
    limit: 2,
    where: {
      primaryTeachers: {
        equals: staff.docs?.[0].id,
      },
    },
  });

  const classesAssisted = await payload.find({
    collection: "classes",
    depth: 2,
    limit: 2,
    where: {
      otherTeachers: {
        equals: staff.docs?.[0].id,
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
          { label: "Staff", url: "/our-school/staff" },
          { label: staff.docs?.[0].name, url: `/our-school/staff/${slug}` },
        ]}
      />

      <Container>
        <div className="flex flex-col gap-8 items-center">
          <H1>{staff.docs?.[0].name}</H1>
          {classesTaught.docs?.length > 0 && (
            <>
              <H2>Classes Taught</H2>
              <div className="flex gap-8 justify-center">
                {classesTaught.docs?.map((taughtClass) => (
                  <ClassCard schoolClass={taughtClass} key={taughtClass.id} />
                ))}
              </div>
            </>
          )}

          {classesAssisted.docs?.length > 0 && (
            <>
              <H2>Classes Assisted</H2>
              <div className="flex gap-8 justify-center">
                {classesAssisted.docs?.map((taughtClass) => (
                  <ClassCard schoolClass={taughtClass} key={taughtClass.id} />
                ))}
              </div>
            </>
          )}

          <H2>Biography</H2>
          <RichText data={staff.docs?.[0].biography} className="text-center" />

          <H2>News Articles</H2>
        </div>
      </Container>
    </div>
  );
}
