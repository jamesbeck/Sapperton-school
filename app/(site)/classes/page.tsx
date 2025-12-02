import Banner from "@/components/banner";
import Container from "@/components/container";
import payload from "@/payload";
import ClassCard from "@/components/classCard";
import Breadcrumbs from "@/components/breadcrumbs";
import H1 from "@/components/ui/h1";

export const revalidate = 30;

export default async function StaffPage() {
  const schoolClasses = await payload.find({
    collection: "classes",
    depth: 2,
    limit: 1000,
  });

  return (
    <div>
      <Banner url={"/defaultBanner.jpg"} focalX={50} focalY={40} />
      <Breadcrumbs crumbs={[{ label: "Our Classes", url: "/classes" }]} />

      <Container>
        <div className="flex flex-col gap-8">
          <H1>Our Classes</H1>
          <div className="flex flex-wrap gap-12 justify-center">
            {schoolClasses.docs?.map((schoolClass) => {
              return (
                <ClassCard schoolClass={schoolClass} key={schoolClass.id} />
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
