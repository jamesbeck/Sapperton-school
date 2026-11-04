import assert from "node:assert/strict";
import test from "node:test";
import { sortSubjects, subjectBreadcrumbs } from "./curriculum";
import type { CurriculumSubject } from "../payload-types";

test("sorts visible subject labels alphabetically without changing headings or URLs", () => {
  const subjects = [
    {
      title: "RE",
      legacyMenuTitle: "Religious Education",
      path: "/curriculum/religious-education",
    },
    { title: "Reading", path: "/curriculum/reading" },
    {
      title: "Early Years Foundation Stage",
      legacyMenuTitle: "EYFS",
      path: "/curriculum/eyfs",
    },
  ];
  const sorted = sortSubjects(subjects);
  assert.deepEqual(
    sorted.map((s) => s.path),
    [
      "/curriculum/eyfs",
      "/curriculum/reading",
      "/curriculum/religious-education",
    ],
  );
  assert.equal(subjects[0].title, "RE");
});

test("preserves existing breadcrumb labels and destinations exactly", () => {
  const crumbs = [
    { label: "Curriculum", url: null },
    { label: "Religious Education", url: "/curriculum/religious-education" },
  ];
  assert.deepEqual(
    subjectBreadcrumbs({
      title: "RE",
      path: "/curriculum/religious-education",
      legacyBreadcrumbs: crumbs,
    } as CurriculumSubject),
    crumbs,
  );
  assert.deepEqual(
    subjectBreadcrumbs({
      title: "New subject",
      path: "/curriculum/new-subject",
    } as CurriculumSubject),
    [
      { label: "Curriculum", url: null },
      { label: "New subject", url: "/curriculum/new-subject" },
    ],
  );
});
