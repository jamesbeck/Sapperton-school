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
