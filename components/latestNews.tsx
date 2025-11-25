"use client";
import { NewsArticle } from "@/payload-types";
import NewsCard from "./newsCard";
import Container from "./container";
import Link from "next/link";
import { AnimateIn } from "@/utils/animateIn";
import { bodoniModa } from "@/fonts";
import H2 from "./ui/h2";

export default function LatestNews({
  newsArticles,
}: {
  newsArticles: NewsArticle[];
}) {
  return (
    <Container colour="white">
      <AnimateIn>
        <div className="mb-8">
          <H2>Latest News</H2>
          <div className="text-right mt-2">
            <Link
              href="/news"
              className="text-sapperton-green hover:text-sapperton-green/80 font-medium hover:underline"
            >
              View all news →
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsArticles.map((article) => (
            <NewsCard key={article.id} article={article} bgColor="green" />
          ))}
        </div>
      </AnimateIn>
    </Container>
  );
}
