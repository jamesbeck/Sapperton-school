import "dotenv/config";
import { getPayload } from "payload";
import config from "../payload.config";
import type { FooterMenuItem, Media, MenuItem, Page } from "../payload-types";

type NavCollection = "menuItems" | "footerMenuItems";
type NavItem = MenuItem | FooterMenuItem;
type CleanupNavMode = "delete" | "repoint" | "none";

type CandidateAction = "create" | "skip" | "needs-review";

type Candidate = {
  media: Media;
  proposedTitle: string;
  proposedDate: string | null;
  dateSource: string;
  existingLetterIds: number[];
  duplicateWarnings: string[];
  action: CandidateAction;
};

type Options = {
  apply: boolean;
  removeLegacyPage: boolean;
  cleanupNav: CleanupNavMode;
};

const canonicalLettersUrl = "/letters";
const monthNames = new Map([
  ["january", 1],
  ["jan", 1],
  ["february", 2],
  ["feb", 2],
  ["march", 3],
  ["mar", 3],
  ["april", 4],
  ["apr", 4],
  ["may", 5],
  ["june", 6],
  ["jun", 6],
  ["july", 7],
  ["jul", 7],
  ["august", 8],
  ["aug", 8],
  ["september", 9],
  ["sept", 9],
  ["sep", 9],
  ["october", 10],
  ["oct", 10],
  ["november", 11],
  ["nov", 11],
  ["december", 12],
  ["dec", 12],
]);

function parseOptions(): Options {
  const args = process.argv.slice(2);
  const cleanupArg = args.find((arg) => arg.startsWith("--cleanup-nav="));
  const cleanupNav = cleanupArg?.split("=")[1] ?? "none";

  if (!["delete", "repoint", "none"].includes(cleanupNav)) {
    throw new Error(
      "Invalid --cleanup-nav value. Use one of: delete, repoint, none.",
    );
  }

  return {
    apply: args.includes("--apply"),
    removeLegacyPage: args.includes("--remove-legacy-page"),
    cleanupNav: cleanupNav as CleanupNavMode,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getDocId(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (isObject(value) && typeof value.id === "number") return value.id;
  return null;
}

function getLastBreadcrumbUrl(item: NavItem): string | null {
  if (!item.breadcrumbs?.length) return null;
  return item.breadcrumbs[item.breadcrumbs.length - 1]?.url ?? null;
}

function getParentTitle(item: NavItem): string | null {
  return isObject(item.parent) && typeof item.parent.title === "string"
    ? item.parent.title
    : null;
}

function isLegacyLettersNavItem(item: NavItem): boolean {
  const title = item.title.toLowerCase();
  const parentTitle = getParentTitle(item)?.toLowerCase() ?? "";
  const breadcrumbUrl = getLastBreadcrumbUrl(item);

  return (
    item.slug === "letters" &&
    title.includes("letter") &&
    (parentTitle.includes("parent") || breadcrumbUrl === "/parents/letters")
  );
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function titleCase(value: string): string {
  const smallWords = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "for",
    "from",
    "in",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
  ]);

  return value
    .split(" ")
    .map((word, index) => {
      if (!word) return word;
      const lower = word.toLowerCase();
      if (index > 0 && smallWords.has(lower)) return lower;
      return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join(" ");
}

function deriveFilenameTitle(media: Media): string {
  const filename = media.filename ?? `Letter ${media.id}`;
  const withoutExtension = filename.replace(/\.[^.]+$/, "");
  const withoutDates = withoutExtension
    .replace(/\b\d{1,2}[.-]\d{1,2}[.-]\d{2,4}\b/g, " ")
    .replace(/\b\d{4}[.-]\d{2}[.-]\d{2}\b/g, " ")
    .replace(/\b\d{6}\b/g, " ")
    .replace(/\b20\d{2}\s*[-/]\s*20\d{2}\b/g, " ");
  const cleaned = normalizeWhitespace(
    withoutDates.replace(/[_-]+/g, " ").replace(/\s+\(\d+\)$/g, ""),
  );

  return titleCase(cleaned || `Letter ${media.id}`);
}

function isMeaningfulAlt(
  alt: string | null | undefined,
  filenameTitle: string,
): alt is string {
  if (!alt) return false;
  const normalized = alt.trim().toLowerCase();
  if (
    normalized.length <= 3 ||
    ["pdf", "document", "letter", "file"].includes(normalized)
  ) {
    return false;
  }

  const normalizedFilenameTitle = normalizeDuplicateKey(filenameTitle);
  const normalizedAlt = normalizeDuplicateKey(alt);

  return (
    normalizedAlt.includes(normalizedFilenameTitle) ||
    normalizedFilenameTitle.includes(normalizedAlt) ||
    normalizedAlt.split(" ").length > normalizedFilenameTitle.split(" ").length
  );
}

function deriveTitle(media: Media): string {
  const filenameTitle = deriveFilenameTitle(media);
  if (isMeaningfulAlt(media.alt, filenameTitle))
    return normalizeWhitespace(media.alt ?? "");
  return filenameTitle;
}

function toIsoDate(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
}

function expandYear(year: string): number {
  if (year.length === 4) return Number(year);
  const value = Number(year);
  return value >= 70 ? 1900 + value : 2000 + value;
}

function parseCompactDate(value: string): string | null {
  const day = Number(value.slice(0, 2));
  const month = Number(value.slice(2, 4));
  const year = expandYear(value.slice(4, 6));
  return toIsoDate(year, month, day);
}

function parseMonth(value: string): number | null {
  return monthNames.get(value.toLowerCase()) ?? null;
}

function deriveDate(
  media: Media,
  title: string,
): { date: string | null; source: string } {
  const sourceText = `${media.filename ?? ""} ${media.alt ?? ""} ${title}`;
  const isoMatch = sourceText.match(
    /\b(20\d{2})[-_. ](\d{1,2})[-_. ](\d{1,2})\b/,
  );
  if (isoMatch) {
    const date = toIsoDate(
      Number(isoMatch[1]),
      Number(isoMatch[2]),
      Number(isoMatch[3]),
    );
    if (date) return { date, source: "filename/title yyyy-mm-dd" };
  }

  const ukMatch = sourceText.match(
    /\b(\d{1,2})[-_. ](\d{1,2})[-_. ](\d{2,4})\b/,
  );
  if (ukMatch) {
    const date = toIsoDate(
      expandYear(ukMatch[3]),
      Number(ukMatch[2]),
      Number(ukMatch[1]),
    );
    if (date) return { date, source: "filename/title dd-mm-yyyy" };
  }

  const dayMonthNameMatch = sourceText.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?[-_., ]+([A-Za-z]+)[-_., ]+(20\d{2}|\d{2})\b/i,
  );
  if (dayMonthNameMatch) {
    const month = parseMonth(dayMonthNameMatch[2]);
    if (month) {
      const date = toIsoDate(
        expandYear(dayMonthNameMatch[3]),
        month,
        Number(dayMonthNameMatch[1]),
      );
      if (date) return { date, source: "filename/title dd month yyyy" };
    }
  }

  const compactDateMatch = sourceText.match(/\b(\d{6})\b/);
  if (compactDateMatch) {
    const date = parseCompactDate(compactDateMatch[1]);
    if (date) return { date, source: "filename/title ddmmyy" };
  }

  const monthYearMatch = sourceText.match(/\b([A-Za-z]+)[-_., ]+(20\d{2})\b/i);
  if (monthYearMatch) {
    const month = parseMonth(monthYearMatch[1]);
    if (month) {
      const date = toIsoDate(Number(monthYearMatch[2]), month, 1);
      if (date) return { date, source: "filename/title month yyyy" };
    }
  }

  if (media.createdAt)
    return { date: media.createdAt, source: "media.createdAt" };

  return { date: null, source: "manual review" };
}

function normalizeDuplicateKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the|a|an|and|to|for|of|in|on|with)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dateOnly(value: string): string {
  return value.slice(0, 10);
}

function formatMaybeDate(value: string | null): string {
  return value ? dateOnly(value) : "-";
}

async function findLegacyPage(payload: Awaited<ReturnType<typeof getPayload>>) {
  const navMatches: { collection: NavCollection; item: NavItem }[] = [];

  for (const collection of ["menuItems", "footerMenuItems"] as const) {
    const result = await payload.find({
      collection,
      where: {
        slug: {
          equals: "letters",
        },
      },
      depth: 2,
      limit: 50,
    });

    for (const item of result.docs as NavItem[]) {
      if (isLegacyLettersNavItem(item)) navMatches.push({ collection, item });
    }
  }

  const pageIds = new Set(
    navMatches
      .map(({ item }) => getDocId(item.page))
      .filter((id): id is number => id !== null),
  );

  if (pageIds.size !== 1) {
    const detail = navMatches
      .map(
        ({ collection, item }) =>
          `${collection}#${item.id} ${item.title} page=${getDocId(item.page) ?? "none"}`,
      )
      .join("; ");
    throw new Error(
      `Expected exactly one legacy /parents/letters page reference, found ${pageIds.size}. Matches: ${detail || "none"}`,
    );
  }

  const pageId = [...pageIds][0];
  const page = await payload.findByID({
    collection: "pages",
    id: pageId,
    depth: 2,
  });

  return { page, navMatches };
}

async function getCandidates(
  payload: Awaited<ReturnType<typeof getPayload>>,
  page: Page,
): Promise<Candidate[]> {
  const mediaFiles = (page.files ?? []).filter(
    (file): file is Media => isObject(file) && typeof file.id === "number",
  );
  const existingLetters = await payload.find({
    collection: "letters",
    depth: 1,
    limit: 1000,
  });

  return mediaFiles.map((media) => {
    const proposedTitle = deriveTitle(media);
    const { date, source } = deriveDate(media, proposedTitle);
    const documentMatchIds = existingLetters.docs
      .filter((letter) => getDocId(letter.document) === media.id)
      .map((letter) => letter.id);
    const proposedKey = date
      ? `${normalizeDuplicateKey(proposedTitle)}:${dateOnly(date)}`
      : null;
    const softMatches = proposedKey
      ? existingLetters.docs.filter((letter) => {
          const key = `${normalizeDuplicateKey(letter.title)}:${dateOnly(letter.date)}`;
          return key === proposedKey && getDocId(letter.document) !== media.id;
        })
      : [];
    const duplicateWarnings = softMatches.map(
      (letter) => `possible title/date duplicate letters#${letter.id}`,
    );

    let action: CandidateAction = "create";
    if (documentMatchIds.length > 0) action = "skip";
    if (!date) action = "needs-review";

    return {
      media,
      proposedTitle,
      proposedDate: date,
      dateSource: source,
      existingLetterIds: documentMatchIds,
      duplicateWarnings,
      action,
    };
  });
}

function printCandidates(candidates: Candidate[]) {
  console.table(
    candidates.map((candidate) => ({
      mediaId: candidate.media.id,
      filename: candidate.media.filename ?? "-",
      title: candidate.proposedTitle,
      date: formatMaybeDate(candidate.proposedDate),
      dateSource: candidate.dateSource,
      existingLetters: candidate.existingLetterIds.join(", ") || "-",
      warnings: candidate.duplicateWarnings.join("; ") || "-",
      action: candidate.action,
    })),
  );
}

async function createLetters(
  payload: Awaited<ReturnType<typeof getPayload>>,
  candidates: Candidate[],
) {
  for (const candidate of candidates) {
    if (candidate.action !== "create" || !candidate.proposedDate) continue;

    const letter = await payload.create({
      collection: "letters",
      data: {
        title: candidate.proposedTitle,
        date: candidate.proposedDate,
        document: candidate.media.id,
        classes: [],
      },
    });

    console.log(
      `Created letters#${letter.id} for media#${candidate.media.id}: ${candidate.proposedTitle}`,
    );
  }
}

async function verifyMigratedDocuments(
  payload: Awaited<ReturnType<typeof getPayload>>,
  candidates: Candidate[],
) {
  const mediaIds = candidates.map((candidate) => candidate.media.id);
  const letters = await payload.find({
    collection: "letters",
    where: {
      document: {
        in: mediaIds,
      },
    },
    depth: 0,
    limit: 1000,
  });
  const counts = new Map<number, number>();

  for (const letter of letters.docs) {
    const documentId = getDocId(letter.document);
    if (documentId === null) continue;
    counts.set(documentId, (counts.get(documentId) ?? 0) + 1);
  }

  const failures = mediaIds.filter((mediaId) => counts.get(mediaId) !== 1);
  if (failures.length > 0) {
    throw new Error(
      `Post-migration verification failed. Expected exactly one letter for media IDs: ${failures.join(", ")}`,
    );
  }

  console.log(`Verified ${mediaIds.length} migrated document references.`);
}

async function cleanupLegacyContent(
  payload: Awaited<ReturnType<typeof getPayload>>,
  page: Page,
  navMatches: { collection: NavCollection; item: NavItem }[],
  options: Options,
) {
  if (!options.removeLegacyPage) {
    console.log(
      "Legacy page cleanup skipped. Pass --remove-legacy-page after reviewing dry-run/apply output.",
    );
    return;
  }

  if (options.cleanupNav === "none" && navMatches.length > 0) {
    throw new Error(
      "Refusing to delete the legacy page while navigation still references it. Pass --cleanup-nav=delete or --cleanup-nav=repoint.",
    );
  }

  for (const { collection, item } of navMatches) {
    if (options.cleanupNav === "delete") {
      await payload.delete({ collection, id: item.id });
      console.log(`Deleted ${collection}#${item.id}: ${item.title}`);
    }

    if (options.cleanupNav === "repoint") {
      await payload.update({
        collection,
        id: item.id,
        data: {
          page: null,
          url: canonicalLettersUrl,
        },
      });
      console.log(
        `Repointed ${collection}#${item.id} to ${canonicalLettersUrl}`,
      );
    }
  }

  const remainingMenuReferences = await payload.find({
    collection: "menuItems",
    where: {
      "page.id": {
        equals: page.id,
      },
    },
    depth: 0,
    limit: 100,
  });
  const remainingFooterReferences = await payload.find({
    collection: "footerMenuItems",
    where: {
      "page.id": {
        equals: page.id,
      },
    },
    depth: 0,
    limit: 100,
  });

  if (
    remainingMenuReferences.totalDocs > 0 ||
    remainingFooterReferences.totalDocs > 0
  ) {
    throw new Error(
      `Refusing to delete pages#${page.id}; ${remainingMenuReferences.totalDocs + remainingFooterReferences.totalDocs} nav references remain.`,
    );
  }

  await payload.delete({ collection: "pages", id: page.id });
  console.log(`Deleted legacy pages#${page.id}: ${page.title}`);
}

async function main() {
  const options = parseOptions();
  const payload = await getPayload({ config });
  const { page, navMatches } = await findLegacyPage(payload);
  const candidates = await getCandidates(payload, page);

  console.log(`Found legacy page pages#${page.id}: ${page.title}`);
  console.log(`Found ${navMatches.length} matching navigation item(s).`);
  console.log(`Found ${candidates.length} attached file(s).`);
  printCandidates(candidates);

  const reviewCount = candidates.filter(
    (candidate) => candidate.action === "needs-review",
  ).length;
  if (reviewCount > 0) {
    throw new Error(
      `${reviewCount} candidate(s) need review before applying. Fix metadata or adjust the script rules, then re-run.`,
    );
  }

  if (!options.apply) {
    console.log(
      "Dry-run complete. Re-run with --apply to create missing letters.",
    );
    return;
  }

  await createLetters(payload, candidates);
  await verifyMigratedDocuments(payload, candidates);
  await cleanupLegacyContent(payload, page, navMatches, options);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
