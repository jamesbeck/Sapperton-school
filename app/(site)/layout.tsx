import type { Metadata } from "next";
import { geistSans, geistMono } from "@/fonts";
import "./globals.css";
import Header from "@/components/header";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { GroupedMenuItem } from "@/types";
import { MenuItem } from "@/payload-types";
import Footer from "@/components/footer";

const payload = await getPayload({ config: configPromise });

export const metadata: Metadata = {
  title: "Sapperton Church of England Primary School",
  description: "Sapperton Church of England Primary School",
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
    sort: ["order", "id"],
    // id: "507f1f77bcf86cd799439011",
  });

  const menuItemsGrouped: GroupedMenuItem[] = menuItems.docs.reduce(
    (acc, item) => {
      if (!item.parent) {
        acc.push({
          id: item.id,
          title: item.title,
          href: item.url||item.breadcrumbs?.[item.breadcrumbs.length - 1].url || "",
          children: [],
        });
      } else {
        const parent = acc.find((i) => i.id === (item.parent as MenuItem)?.id);
        if (parent) {
          parent.children.push({
            id: item.id,
            title: item.title,
            href: item.url||item.breadcrumbs?.[item.breadcrumbs.length - 1].url || "",
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
        className={`antialiased ${geistSans.variable} ${geistMono.variable}`}
      >
        <Header menuItems={menuItemsGrouped} classes={classes.docs || []} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
