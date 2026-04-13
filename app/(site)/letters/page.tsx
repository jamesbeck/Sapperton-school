import Banner from "@/components/banner";
import Container from "@/components/container";
import Breadcrumbs from "@/components/breadcrumbs";
import H1 from "@/components/ui/h1";
import LettersArchive from "@/components/lettersArchive";
import payload from "@/payload";

export const revalidate = 30;

export default async function LettersPage() {
  const [lettersResult, classesResult] = await Promise.all([
    payload.find({
      collection: "letters",
      depth: 2,
      limit: 500,
      sort: "-date",
    }),
    payload.find({
      collection: "classes",
      depth: 0,
      limit: 100,
      sort: "order",
    }),
  ]);

  return (
    <div>
      <Banner url={"/defaultBanner.jpg"} focalX={50} focalY={40} />
      <Breadcrumbs crumbs={[{ label: "Letters", url: "/letters" }]} />

      <Container>
        <div className="flex flex-col gap-12">
          <H1>Letters</H1>

          {lettersResult.docs.length > 0 ? (
            <LettersArchive
              letters={lettersResult.docs}
              classes={classesResult.docs}
            />
          ) : (
            <p className="text-center text-gray-600">
              No letters yet. Check back soon!
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}
