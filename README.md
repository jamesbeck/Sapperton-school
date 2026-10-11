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

Manage clubs under **Clubs** in Payload. Each club has a description, year groups,
club leaders/supporting staff, banner, card photo and gallery. Add a row under
**Weekly sessions** for each session: weekday, start time and end time in 24-hour
`HH:mm` format. Each session starts and ends on the same day, in local school time.
These are weekly timetable entries, not automatically generated calendar events.

Choose relevant clubs on news articles to show those articles on club pages and
link back from news. The website lists clubs at `/clubs`, adds them to navigation,
and links them from participating staff profiles. Clubs sort by order, then name.
URLs are generated on creation and stay unchanged when a club is renamed.

Before deploying this feature, back up the database and run `npm run migrate`
against the intended database using the normal environment configuration. The
club migration preserves existing clubs/staff and backfills unique slugs before
applying the required and unique constraints. It must run before the updated
site starts querying the new fields. Its rollback removes the added club fields,
sessions, gallery references and news associations; it retains original clubs,
descriptions, banners and club-leader assignments.

For the migration/CMS integration check, use an **empty disposable local database**
named `sapperton_clubs_test`:

```sh
CLUBS_TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:55484/sapperton_clubs_test npm run test:clubs
```

The check refuses other database names or non-local hosts, exercises migration
up/down and CMS validation, and leaves fixtures for browser testing. It does not
use the configured school database. Schedule unit tests run with `npm test`.
