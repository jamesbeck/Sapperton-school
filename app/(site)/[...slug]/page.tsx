import CurriculumSubjectPage from "@/components/curriculumSubjectPage";
import ContentPageView from "@/components/contentPage";
import { notFound } from "next/navigation";
import type { Page } from "@/payload-types";
import payload from "@/payload";

export const revalidate = 30;

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const slug = (await params).slug;

  const path = `/${slug.join("/")}`;
  if (slug[0] === "curriculum") {
    const subjects = await payload.find({
      collection: "curriculumSubjects",
      depth: 2,
      limit: 1,
      where: { path: { equals: path } },
    });
    if (subjects.docs[0]) {
      if (subjects.docs[0]._status !== "published") return notFound();
      return <CurriculumSubjectPage subject={subjects.docs[0]} />;
    }
    // Original menu-backed pages remain available until the data migration is complete.
  }

  //final slug
  const finalSlug = slug[slug.length - 1];

  // Check main menu items first
  const menuItems = await payload.find({
    collection: "menuItems",
    where: {
      slug: {
        equals: finalSlug,
      },
    },
    depth: 2,
  });

  // If not found in main menu, check footer menu items
  let footerMenuItems = { docs: [] as typeof menuItems.docs };
  if (!menuItems.docs?.[0]?.page) {
    footerMenuItems = await payload.find({
      collection: "footerMenuItems",
      where: {
        slug: {
          equals: finalSlug,
        },
      },
      depth: 2,
    });
  }

  // Use whichever has a page
  const currentMenuItem = menuItems.docs?.[0]?.page
    ? menuItems.docs[0]
    : footerMenuItems.docs?.[0];

  const isFooterMenuItem =
    !menuItems.docs?.[0]?.page && footerMenuItems.docs?.[0]?.page;
  const collection = isFooterMenuItem ? "footerMenuItems" : "menuItems";

  if (!currentMenuItem?.page) {
    return notFound();
  }

  const page = currentMenuItem.page as Page;
  // Fetch sibling pages
  let siblingPages: typeof menuItems.docs = [];
  let parentName = "";

  if (currentMenuItem.parent) {
    const parentId =
      typeof currentMenuItem.parent === "number"
        ? currentMenuItem.parent
        : currentMenuItem.parent.id;

    const parent =
      typeof currentMenuItem.parent === "number"
        ? await payload.findByID({
            collection: collection,
            id: parentId,
          })
        : currentMenuItem.parent;

    parentName = parent.title;

    const siblings = await payload.find({
      collection: collection,
      where: {
        parent: {
          equals: parentId,
        },
        id: {
          not_equals: currentMenuItem.id,
        },
      },
      depth: 2,
      sort: "order",
      limit: 1000,
    });

    siblingPages = siblings.docs.filter((item) => item.page);
  }

  return (
    <ContentPageView
      page={page}
      currentMenuItem={currentMenuItem}
      siblingPages={siblingPages.map((item) => ({
        ...item,
        page: item.page as Page,
      }))}
      parentName={parentName}
    />
  );
}

export const generateStaticParams = async () => {
  const menuItems = await payload.find({
    collection: "menuItems",
    depth: 2,
    limit: 1000,
    where: {
      parent: { exists: true },
      url: { exists: false },
    },
  });

  const footerMenuItems = await payload.find({
    collection: "footerMenuItems",
    depth: 2,
    limit: 1000,
    where: {
      parent: { exists: true },
      url: { exists: false },
    },
  });

  const subjects = await payload.find({
    collection: "curriculumSubjects",
    depth: 0,
    pagination: false,
    where: { _status: { equals: "published" } },
  });
  const subjectParams = subjects.docs.map((subject) => ({
    slug: subject.path.split("/").filter(Boolean),
  }));
  const allItems = [...menuItems.docs, ...footerMenuItems.docs];

  return [
    ...subjectParams,
    ...allItems.map((item) => {
      return {
        slug:
          item.breadcrumbs?.[item.breadcrumbs.length - 1]?.url
            ?.split("/")
            .filter(Boolean) || "",
      };
    }),
  ];
};
