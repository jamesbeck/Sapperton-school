"use client";
import { NewsArticle } from "@/payload-types";
import NewsCard from "./newsCard";
import Container from "./container";
import Link from "next/link";
import { AnimateIn } from "@/utils/animateIn";

export default function LatestNews({
  newsArticles,
}: {
  newsArticles: NewsArticle[];
}) {
  return (
    <Container colour="white">
      <AnimateIn>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-white">Latest News</h2>
          <Link
            href="/news"
            className="text-white hover:text-white/80 font-medium hover:underline"
          >
            View all news →
          </Link>
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
