import Banner from "@/components/banner";
import Container from "@/components/container";
import payload from "@/payload";
import H2 from "@/components/ui/h2";
import StaffCard from "@/components/staffCard";
import { StaffGroup } from "@/payload-types";
import Breadcrumbs from "@/components/breadcrumbs";
import H1 from "@/components/ui/h1";

export default async function StaffPage() {
  return (
    <div>
      <Banner url={"/defaultBanner.jpg"} focalX={50} focalY={40} />
      <Breadcrumbs crumbs={[{ label: "Our School", url: "/our-school" }]} />

      <Container>
        <div className="flex flex-col space-y-8">
          <H1>Our School</H1>
        </div>
      </Container>
    </div>
  );
}
