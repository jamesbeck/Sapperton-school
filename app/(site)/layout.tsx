import type { Metadata, Viewport } from "next";
import { geistSans, geistMono, bodoniModa } from "@/fonts";
import "./globals.css";
import Header from "@/components/header";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { GroupedMenuItem } from "@/types";
import { MenuItem, FooterMenuItem } from "@/payload-types";
import Footer from "@/components/footer";
import { Analytics } from "@vercel/analytics/react";
import SchoolAssistant from "@/components/schoolAssistant";

// Revalidate menu structure every 30 seconds
export const revalidate = 30;

const payload = await getPayload({ config: configPromise });

const siteName = "Sapperton Church of England Primary School";
const siteDescription =
  "A warm village school in the heart of the Cotswolds, nurturing faith, inspiring success and helping every child flourish.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.sappertonschool.org"
  ),
  title: {
    default: siteName,
    template: `%s | Sapperton C of E Primary School`,
  },
  description: siteDescription,
  applicationName: "Sapperton C of E Primary School",
  keywords: [
    "Sapperton Primary School",
    "Sapperton C of E Primary School",
    "primary school Gloucestershire",
    "primary school Cotswolds",
    "Church of England primary school",
  ],
  authors: [{ name: siteName, url: "/" }],
  creator: siteName,
  publisher: siteName,
  category: "education",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/share-image.png",
        width: 1200,
        height: 630,
        alt: "Sapperton Church of England Primary School pupils outdoors, with the school name and motto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/share-image.png",
        width: 1200,
        height: 630,
        alt: "Sapperton Church of England Primary School pupils outdoors, with the school name and motto",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#347560",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menuItems = await payload.find({
    collection: "menuItems",
    depth: 1,
    limit: 1000,
    sort: ["-parent", "order", "id"],
    // id: "507f1f77bcf86cd799439011",
  });

  const classes = await payload.find({
    collection: "classes",
    depth: 1,
    limit: 1000,
    sort: "order",
  });

  const footerMenuItems = await payload.find({
    collection: "footerMenuItems",
    depth: 1,
    limit: 1000,
    sort: ["-parent", "order", "id"],
  });

  const menuItemsGrouped: GroupedMenuItem[] = menuItems.docs.reduce(
    (acc, item) => {
      if (!item.parent) {
        acc.push({
          id: item.id,
          title: item.title,
          href:
            item.url ||
            item.breadcrumbs?.[item.breadcrumbs.length - 1].url ||
            "",
          children: [],
        });
      } else {
        const parent = acc.find((i) => i.id === (item.parent as MenuItem)?.id);
        if (parent) {
          parent.children.push({
            id: item.id,
            title: item.title,
            href:
              item.url ||
              item.breadcrumbs?.[item.breadcrumbs.length - 1].url ||
              "",
            children: [],
          });
        }
      }
      return acc;
    },
    [] as GroupedMenuItem[]
  );

  const footerMenuItemsGrouped: GroupedMenuItem[] = footerMenuItems.docs.reduce(
    (acc, item) => {
      if (!item.parent) {
        acc.push({
          id: item.id,
          title: item.title,
          href:
            item.url ||
            item.breadcrumbs?.[item.breadcrumbs.length - 1].url ||
            "",
          children: [],
        });
      } else {
        const parent = acc.find(
          (i) => i.id === (item.parent as FooterMenuItem)?.id
        );
        if (parent) {
          parent.children.push({
            id: item.id,
            title: item.title,
            href:
              item.url ||
              item.breadcrumbs?.[item.breadcrumbs.length - 1].url ||
              "",
            children: [],
          });
        }
      }
      return acc;
    },
    [] as GroupedMenuItem[]
  );

  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <body
        className={`antialiased ${geistSans.variable} ${geistMono.variable} ${bodoniModa.variable}`}
      >
        <Header
          menuItems={menuItemsGrouped}
          footerMenuItems={footerMenuItemsGrouped}
          classes={classes.docs || []}
        />
        {children}
        <SchoolAssistant />
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
