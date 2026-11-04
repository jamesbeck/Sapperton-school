This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Clubs

Manage clubs under **Clubs** in Payload. Each club has year groups, optional
activity description, staff, photos and gallery. Keep administrative details out
of the description. Add **Term blocks** for each term: label, inclusive dates,
weekly sessions (local `HH:mm` times), excluded dates and reasons, full block
price, capacity, booking method/link/status, external leader, snack and equipment.
Session counts and optional per-session prices are calculated from the timetable
and exclusions. Capacity means maximum places, not remaining availability.

Manage shared policy and the payment-plan contact under **Club booking
information**. The overview shows compact cards for the current block, next
upcoming block, or latest previous block. Previous blocks stay accessible on club
pages; finished/full/closed blocks do not show a booking action. Without a supplied
ParentPay link, the page states the booking method rather than inventing a URL.

News and staff continue to link to permanent club pages. Clubs sort by order,
then name, and URLs stay unchanged when names change.

The term-block release uses two migrations. Run
`20261014_131520_add_club_term_blocks` first to prepare the new tables while the old
site still works. Populate term blocks with confirmed dates and transfer each old
timetable. Promote the new website before clearing duplicated description content
and running `20261014_131521_retire_club_weekly_sessions`. The retirement migration
refuses to delete any timetable not copied into a block. Do not run both pending
migrations against the old live application. Keep a content backup for rollback;
retirement rollback restores the latest block's timetable, while reverting the
first migration removes term-block and shared-policy data.

For the migration/CMS integration check, use an **empty disposable local database**
named `sapperton_clubs_test`:

```sh
CLUBS_TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:55484/sapperton_clubs_test npm run test:clubs
```

The check refuses other database names or non-local hosts, exercises migration
up/down and CMS validation, and leaves fixtures for browser testing. It does not
use the configured school database. Schedule unit tests run with `npm test`.

### Curriculum Subjects rollout

Curriculum subjects keep their exact existing `/curriculum/...` paths. The new
collection stores subject content, media, drafts and revision history. The header
builds the Curriculum section last, sorting its visible subject labels alphabetically.
News articles can tag multiple subjects; subject pages show the six latest tagged
articles, and articles link back to published subjects. Empty sections are hidden.

Before rollout, pause curriculum editing briefly and take a database-provider
backup/snapshot. Review `payload migrate:status`, then run the registered migrations
with `npm run migrate` against the intended database before building the new app.
The two November curriculum migrations add the schema and copy page content,
ordered media relationships and **all** versions. They preserve page IDs in
`legacyPageId`, original menu labels, breadcrumbs, timestamps and complete menu
rows. Original Pages and their versions remain stored, are hidden from the Pages
list, and cannot be updated/deleted through normal editor access.

Deploy the application and verify each of the 15 existing curriculum URLs, preview,
media, alphabetical navigation and news tags. **Do not remove the old menu records
before the new application is serving traffic.** They keep the old deployment
working while the new one is prepared. Then run:

```sh
npm run migrate:curriculum:cleanup              # dry-run; no changes committed
npm run migrate:curriculum:cleanup -- --apply  # remove only archived menu records
```

Cleanup refuses to remove menus/breadcrumbs edited after migration, unexpected new
children, or original Pages edited after conversion. Reconcile any such edits first.
It preserves all original content and the complete navigation archive. Website
caches refresh within 30 seconds. No existing news tags are changed or inferred.

For an application rollback, restore the original navigation **before** switching
back to the old code:

```sh
npm run migrate:curriculum:cleanup -- --restore --apply
```

This restores exact menu IDs, labels, hierarchy, order and breadcrumbs, without
removing new subject content or news tags. Original Pages represent the content at
conversion time; reconcile subsequent subject edits before rolling back. The data
migration deliberately refuses destructive `down` operations.

Verification uses synthetic records, never exports live page bodies/history, and
requires a disposable local `sapperton_curriculum_test` database containing the old
schema but no rows:

```sh
CURRICULUM_TEST_DATABASE_URL=postgresql://...@127.0.0.1:55485/sapperton_curriculum_test npm run test:curriculum
node --import tsx --test utils/*.test.ts
npx tsc --noEmit
```

The integration check verifies all content/version fields and media ordering,
unchanged URLs after renaming, draft/public separation, rerun safety, menu cleanup
and exact restoration, conflict guards, original retention and two-way news tags.

## Public page caching

Public pages use one-hour Incremental Static Regeneration (ISR), rather than
30-second revalidation. Existing content, news, class, club, event and staff
detail pages are pre-rendered during production builds. Newly created URLs render
on their first visit and are then cached. Preview remains request-rendered.

`payload.config.ts` registers shared `afterChange` and `afterDelete` hooks for
every public content collection (excluding users), plus `afterChange` for all
globals. These invalidate the `/(site)` layout, its pages, and the sitemap. This deliberately
covers shared navigation, media, related content, old URLs after renames, deleted
records, and both main-menu and footer pages without fragile per-record mappings.
It does mean a CMS save invalidates all public pages, not just the edited page.
Pages regenerate on their next visit; saves do not eagerly rebuild the website
or push updated content into already-open visitor tabs.

The hourly fallback is needed even without CMS edits because upcoming events and
club states change with the clock. Time-based ISR serves cached content while
refreshing in the background, so this is a refresh interval, not a strict freshness
deadline. The calendar subscription feed retains its separate five-minute cache.

Scripts using Payload outside Next.js must pass
`context: { skipRevalidation: true }` and arrange a deployment or invalidation
afterwards. CMS edits through the deployed application invalidate its own cache;
direct SQL changes or changes from a separate CMS deployment do not.

Validate caching with `npm run build` and `npm start`; development mode does not
represent production caching. Smoke-test a CMS save and deletion against affected
pages after deploying, including related listings and a footer-linked content page.
