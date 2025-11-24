"use client";
import { HoverScale } from "@/utils/hoverScale";
import Image from "next/image";
import { NewsArticle, Media, Staff } from "@/payload-types";
import Link from "next/link";

export default function NewsCard({
  article,
  bgColor = "white",
}: {
  article: NewsArticle;
  bgColor?: "white" | "green";
}) {
  const banner = article.banner as Media;
  const author = article.author as Staff;
  const isGreen = bgColor === "green";

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
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
            {banner?.url ? (
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
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <svg
                  className="w-20 h-20 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h3
              className={`text-xl font-bold group-hover:underline line-clamp-2 ${
                isGreen ? "text-white" : "text-gray-900"
              }`}
            >
              {article.headline}
            </h3>
            <div
              className={`flex flex-col gap-1 text-sm ${
                isGreen ? "text-white/90" : "text-gray-600"
              }`}
            >
              <p>{formatDate(article.date)}</p>
              {author && <p className="font-medium">By {author.name}</p>}
            </div>
          </div>
        </div>
      </HoverScale>
    </Link>
  );
}
