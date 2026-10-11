import payload from "@/payload";
import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.sappertonschool.org";

const routes = [
  "",
  "/our-school",
  "/our-school/staff",
  "/classes",
  "/clubs",
  "/news",
  "/events",
  "/letters",
  "/term-dates",
  "/contact-us",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const clubs = await payload.find({
    collection: "clubs",
    depth: 0,
    pagination: false,
  });
  return [
    ...routes.map<MetadataRoute.Sitemap[number]>((route, index) => ({
      url: `${siteUrl}${route}`,
      changeFrequency: index === 0 ? "weekly" : "monthly",
      priority: index === 0 ? 1 : 0.7,
    })),
    ...clubs.docs.map((club) => ({
      url: `${siteUrl}/clubs/${club.slug}`,
      lastModified: club.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
