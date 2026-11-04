import payload from "@/payload";
import type { CurriculumSubject } from "@/payload-types";
import ContentPageView from "./contentPage";
import { subjectBreadcrumbs } from "@/utils/curriculum";

export default async function CurriculumSubjectPage({
  subject,
}: {
  subject: CurriculumSubject;
}) {
  const [siblings, news] = await Promise.all([
    payload.find({
      collection: "curriculumSubjects",
      depth: 1,
      pagination: false,
      sort: ["legacyMenuOrder", "title"],
      where: {
        _status: { equals: "published" },
        id: { not_equals: subject.id },
      },
    }),
    payload.find({
      collection: "newsArticles",
      depth: 2,
      sort: "-date",
      limit: 6,
      where: { curriculumSubjects: { equals: subject.id } },
    }),
  ]);
  return (
    <ContentPageView
      page={subject}
      currentMenuItem={{ breadcrumbs: subjectBreadcrumbs(subject) }}
      parentName="Curriculum"
      newsArticles={news.docs}
      siblingPages={siblings.docs.map((item) => ({
        id: item.id,
        page: item,
        breadcrumbs: [{ url: item.path }],
      }))}
    />
  );
}
