"use client";
import { HoverScale } from "@/utils/hoverScale";
import Image from "next/image";
import { NewsArticle, Media } from "@/payload-types";
import Link from "next/link";

export default function NewsCard({ article }: { article: NewsArticle }) {
  const banner = article.banner as Media;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Link href={`/news/${article.slug}`}>
      <HoverScale>
        <div className="flex flex-col gap-4 group">
          {banner?.url && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
              <Image
                src={banner.sizes?.small?.url || banner.url || ""}
                alt={banner.alt || article.headline}
                width={800}
                height={450}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                style={{
                  objectPosition: `${banner.focalX}% ${banner.focalY}%`,
                }}
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold group-hover:underline line-clamp-2">
              {article.headline}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDate(article.date)}
            </p>
          </div>
        </div>
      </HoverScale>
    </Link>
  );
}
