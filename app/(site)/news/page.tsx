import Banner from "@/components/banner";
import Container from "@/components/container";
import Breadcrumbs from "@/components/breadcrumbs";
import H1 from "@/components/ui/h1";
import NewsCard from "@/components/newsCard";
import payload from "@/payload";

export const revalidate = 30;

export default async function NewsIndexPage() {
  const newsArticles = await payload.find({
    collection: "newsArticles",
    depth: 2,
    limit: 100,
    sort: "-date",
  });

  return (
    <div>
      <Banner url={"/defaultBanner.jpg"} focalX={50} focalY={40} />
      <Breadcrumbs crumbs={[{ label: "News", url: "/news" }]} />

      <Container>
        <div className="flex flex-col gap-12">
          <H1>School News</H1>

          {newsArticles.docs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsArticles.docs.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">
              No news articles yet. Check back soon!
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}
