import type { CurriculumSubject } from "../payload-types";

export function subjectBreadcrumbs(subject: CurriculumSubject) {
  const stored = subject.legacyBreadcrumbs;
  if (Array.isArray(stored))
    return stored as { label?: string | null; url?: string | null }[];
  return [
    { label: "Curriculum", url: null },
    { label: subject.title, url: subject.path },
  ];
}

export function sortSubjects<
  T extends Pick<CurriculumSubject, "title" | "legacyMenuTitle">,
>(subjects: T[]): T[] {
  return [...subjects].sort((a, b) =>
    (a.legacyMenuTitle || a.title).localeCompare(
      b.legacyMenuTitle || b.title,
      "en-GB",
      { sensitivity: "base" },
    ),
  );
}
