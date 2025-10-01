import Banner from "@/components/banner";
import Container from "@/components/container";
import payload from "@/payload";
import H2 from "@/components/ui/h2";
import StaffCard from "@/components/staffCard";
import { StaffGroup } from "@/payload-types";
import Breadcrumbs from "@/components/breadcrumbs";
import H1 from "@/components/ui/h1";

export default async function StaffPage() {
  const staffGroups = await payload.find({
    collection: "staffGroups",
    depth: 2,
    limit: 1000,
    sort: "order",
  });

  const staff = await payload.find({
    collection: "staff",
    depth: 2,
    limit: 1000,
  });

  return (
    <div>
      <Banner url={"/hero/1.png"} focalX={50} focalY={30} />
      <Breadcrumbs crumbs={[{ label: "Staff", url: "/our-school/staff" }]} />

      <Container>
        <div className="flex flex-col space-y-8">
          <H1>Staff</H1>
          {staffGroups.docs?.map((staffGroup) => (
            <div
              className="flex flex-col space-y-8 border-b border-foreground pb-8"
              key={staffGroup.id}
            >
              <H2>{staffGroup.name}</H2>
              <div className="flex flex-wrap gap-12 justify-center">
                {staff.docs?.map((staff) => {
                  let staffIsInGroup = false;

                  for (const group of staff.staffGroup) {
                    if ((group as StaffGroup).id === staffGroup.id) {
                      staffIsInGroup = true;
                    }
                  }

                  if (staffIsInGroup) {
                    return <StaffCard staff={staff} key={staff.id} />;
                  }
                })}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
