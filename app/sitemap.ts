import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.sappertonschool.org";

const routes = [
  "",
  "/our-school",
  "/our-school/staff",
  "/classes",
  "/news",
  "/events",
  "/letters",
  "/term-dates",
  "/contact-us",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route, index) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
