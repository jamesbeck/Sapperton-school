import Banner from "@/components/banner";
import Container from "@/components/container";
import payload from "@/payload";
import { Media } from "@/payload-types";
import Breadcrumbs from "@/components/breadcrumbs";
import H2 from "@/components/ui/h2";
import { RichText } from "@payloadcms/richtext-lexical/react";
import ClassCard from "@/components/classCard";
import H1 from "@/components/ui/h1";
import Image from "next/image"

export default async function StaffPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const staffResults = await payload.find({
    collection: "staff",
    depth: 2,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  const staff = staffResults.docs[0]
  const image = staff.image as Media;

  const classesTaught = await payload.find({
    collection: "classes",
    depth: 2,
    limit: 2,
    where: {
      primaryTeachers: {
        equals: staff.id,
      },
    },
  });

  const classesAssisted = await payload.find({
    collection: "classes",
    depth: 2,
    limit: 2,
    where: {
      otherTeachers: {
        equals: staff.id,
      },
    },
  });

  return (
    <div>
      <Banner
        url={"/hero/1.png"}
        focalX={50}
        focalY={30}
      />

      <Breadcrumbs
        crumbs={[
          { label: "Staff", url: "/our-school/staff" },
          { label: staff.name, url: `/our-school/staff/${slug}` },
        ]}
      />

      <Container>
        <div className="flex flex-col gap-8 items-center">
          <H1>{staff.name}</H1>
          <div className="relative w-48 h-48 rounded-full overflow-hidden">
            {!!image?.url && (
              <Image
                src={image?.url || ""}
                alt={staff.name || ""}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: `${image?.focalX}% ${image?.focalY}%`,
                }}
              />
            )}
          </div>
          <RichText data={staff.biography} className="page-content" />
          

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

        </div>
      </Container>

      <Container colour="green">
        {classesTaught.docs?.length > 0 && (
            <div className="flex flex-col gap-8">
              <H2>Classes Taught</H2>
              <div className="flex gap-8 justify-center">
                {classesTaught.docs?.map((taughtClass) => (
                  <ClassCard schoolClass={taughtClass} key={taughtClass.id} />
                ))}
              </div>
            </div>
          )}
      </Container>

      <Container>
        {/* {classesTaught.docs?.length > 0 && ( */}
            <div className="flex flex-col gap-8">
              <H2>News Articles</H2>
              <div className="flex gap-8 justify-center">
                Coming soon!
              </div>
            </div>
          {/* )} */}
      </Container>
    </div>
  );
}
