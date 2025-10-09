# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sapperton Church of England Primary School website - A Next.js 15 application with PayloadCMS as the content management system. The site uses PostgreSQL for data storage, S3 (Wasabi) for media files, and SendGrid for contact form emails.

## Development Commands

```bash
# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Regenerate TypeScript types from PayloadCMS collections
npm run generate:types
```

## Architecture

### Dual Application Structure

This project runs two applications in parallel:
- **Next.js Frontend** (`/app/(site)/*`) - Public-facing school website
- **PayloadCMS Admin** (`/app/(payload)/*`) - Content management at `/admin`

The frontend fetches content from PayloadCMS collections via the Payload API. The root layout (`app/(site)/layout.tsx`) loads menu structure and classes at the top level, making them available throughout the app.

### Content Management System

**PayloadCMS Collections** (`/collections/*.ts`):
- `MenuItems` - Hierarchical navigation with nested-docs plugin
- `Pages` - Content pages with rich text, galleries, and file attachments
- `Staff` / `StaffGroups` - Staff directory
- `Classes` - Class information
- `Clubs` - After-school clubs
- `Events` - School events (includes "Open Day" type)
- `NewsArticles` - News posts
- `Media` - Images/files with S3 storage and automatic resizing
- `Users` - Admin authentication

**Global Settings** (`/globals/*.tsx`):
- `HeroWords` - Rotating hero text on homepage
- `HeadteacherWelcome` - Headteacher message and quote

### Navigation and Routing Pattern

The site uses a **hierarchical menu system** powered by PayloadCMS's nested-docs plugin:

1. **MenuItems Collection** - Uses parent/child relationships with automatic slug generation
   - Each MenuItem has an optional `parent` relationship
   - Slugs auto-generated from titles using `slugify`
   - The `nestedDocsPlugin` generates breadcrumbs and full URL paths
   - Changes to MenuItems trigger full layout revalidation

2. **Catch-all Route** (`app/(site)/[...slug]/page.tsx`) - Renders all dynamic pages
   - Matches final slug segment to find correct MenuItem
   - Retrieves associated Page content via relationship
   - Fetches sibling pages for "More from [Parent]" section
   - Displays banner, breadcrumbs, rich content, gallery, files, and related pages

3. **Menu Structure in Layout** - Built at root level for Header component
   - Root layout transforms flat MenuItems into hierarchical `GroupedMenuItem[]`
   - Header receives pre-structured menu data for navigation

### Media and Image Handling

The **Media collection** uses S3 storage (Wasabi) with automatic image resizing:

```typescript
// Three sizes generated for each upload
thumbnail: 200x200   // For thumbnails and previews
small: 800x450       // For gallery main views and cards
large: 1920x1080     // For hero banners
```

**Access pattern**: Always use sized versions, not originals:
```typescript
media.sizes?.small?.url || media.url
media.sizes?.thumbnail?.url || media.url
```

All media is publicly readable (`disablePayloadAccessControl: true`). Local storage is disabled in favor of S3.

### Styling System

**Container Component** (`/components/container.tsx`) - Provides alternating section backgrounds:
- `colour="white"` - White background
- `colour="green"` - Sapperton green with white text
- `colour="transparent"` - Transparent (default)

**Pattern**: Alternate containers for visual rhythm (white → green → white)

**Styling approach**:
- Tailwind CSS with custom theme (`sapperton-green` color)
- Framer Motion for animations via `AnimateIn` utility
- Custom fonts: Bodoni Moda (headings), Geist Sans/Mono (body)
- Responsive: mobile-first with md/lg breakpoints

### Form Submissions

**Server Actions pattern** (`/app/actions/*.ts`):
- Contact form uses Next.js 15 server actions
- `sendContactEmail` action handles validation and SendGrid integration
- Client-side forms use `react-hook-form` for validation
- Emails sent from `sappertonwebsite@jamesbeck.co.uk` to `james@jamesbeck.co.uk`

## Type System

TypeScript types are **auto-generated** from PayloadCMS collections:

```bash
npm run generate:types
```

This creates `payload-types.ts` with interfaces for all collections, globals, and relationships. Run this command after modifying any PayloadCMS collection schema.

## Key Patterns and Conventions

### ESLint Apostrophe Rule
The project enforces escaped apostrophes in JSX. Always use `&apos;` instead of `'`:
```tsx
// ✗ Bad
<p>We'd love to help</p>

// ✓ Good
<p>We&apos;d love to help</p>
```

### Page Data Fetching
Pages fetch data directly from Payload at the component level (Server Components):
```typescript
const payload = await getPayload({ config: configPromise });
const result = await payload.find({
  collection: "events",
  where: { type: { equals: "open-day" } },
});
```

### Menu Item Hooks
MenuItems trigger layout revalidation on change to update the header navigation:
```typescript
hooks: {
  afterChange: [async () => {
    revalidatePath("/", "layout");
  }],
}
```

### Special Page Routes
- `/contact-us` - Contact form with map and SendGrid integration
- `/our-school/staff` - Staff directory with grouping
- `/classes/[slug]` - Individual class pages
- `/[...slug]` - All CMS-managed pages

## Environment Variables

Required environment variables (`.env`):

```bash
# PayloadCMS
PAYLOAD_SECRET=<secret>
PREVIEW_KEY=<key>

# Database (PostgreSQL)
DATABASE_URL=<postgres_connection_string>

# S3 Storage (Wasabi)
S3_BUCKET=<bucket_name>
S3_ACCESS_KEY_ID=<key>
S3_SECRET_ACCESS_KEY=<secret>
S3_REGION=<region>
S3_ENDPOINT=<wasabi_endpoint>

# Email (SendGrid)
SENDGRID_API_KEY=<api_key>
```

## Important Notes

- **Never commit `.env`** - Contains sensitive credentials
- **Apostrophes in JSX** - Must be escaped as `&apos;` for ESLint
- **Image sizes** - Always prefer `sizes?.small` or `sizes?.thumbnail` over original
- **Type generation** - Run after any collection schema changes
- **Menu revalidation** - Layout automatically rebuilds when menu changes
- **Contact form** - Requires valid SendGrid API key and verified sender email
