# Curious Geeks — Full Project Context

> **For any AI assistant starting a new session:** Read this entire file before touching any code. It covers every decision, every gotcha, and every file in the project. Do not guess — the answers are here.
>
> **Instruction for AI doing features or fixes:** After completing any feature or bug fix, append an entry to the **Changelog** section at the bottom of this file and push the updated README as part of the same commit. One line per entry: date, what changed, why.

---

## 1. What This Is

**Curious Geeks** (`curiousgeekspm.com`) is a community website for people who build products and pay attention. Built with Next.js 14 App Router, hosted on Vercel, database on Neon Postgres.

**Owner / Admin:** Divyaraj Murugan  
**Admin email:** `divyaraj.murugan@curiousgeekspm.com`  
**GitHub repo:** `https://github.com/Divyaraj-M/curiousgeeks`  
**Production URL:** `https://curiousgeekspm.com`

---

## 2. Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 14 (App Router) | TypeScript, server components throughout |
| Styling | Tailwind CSS | Custom design system, persimmon brand (`#F26B3A`) |
| Database | Neon Postgres (serverless) | `@neondatabase/serverless` — uses HTTP, not TCP |
| Auth | JWT in httpOnly cookie | `jose` library, cookie name `cg_session`, 30-day expiry |
| Passwords | bcryptjs | 12 rounds |
| Email | Nodemailer + Gmail SMTP | Authenticated as `divyaraj.murugan@curiousgeekspm.com` |
| Blog editor | `@uiw/react-md-editor` | Split markdown/preview editor, admin-only |
| Blog rendering | `next-mdx-remote` v6 | RSC import: `next-mdx-remote/rsc` |
| Icons | `@phosphor-icons/react` | SSR imports from `/dist/ssr` in server components |
| Font | Space Grotesk (variable) | Loaded via `next/font/google` |
| Hosting | Vercel (Hobby / free tier) | Auto-deploys on push to `main` |
| Domain registrar | Squarespace (ex-Google Domains) | DNS managed at `domains.squarespace.com` |

---

## 3. Environment Variables

Stored in `.env.local` (never committed). Must also be set in Vercel dashboard → Project → Settings → Environment Variables.

```
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-curly-sunset-aploz6x7.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
```
> **CRITICAL:** Do NOT add `&channel_binding=require` — it breaks `@neondatabase/serverless` with `TypeError: fetch failed`.

```
JWT_SECRET=4FKgiW72hWduQ40vnrYK333EfuStztyCN8J9H7egYbI=

GMAIL_USER=divyaraj.murugan@curiousgeekspm.com
GMAIL_FROM=hello@curiousgeekspm.com
GMAIL_APP_PASSWORD=<16-char Google App Password>

NEXT_PUBLIC_SITE_URL=https://curiousgeekspm.com
```

**Gmail note:** `hello@curiousgeekspm.com` is an alias. SMTP must authenticate as the real account (`GMAIL_USER`). `GMAIL_FROM` sets the display address. App Password must be generated from `myaccount.google.com` for `divyaraj.murugan@curiousgeekspm.com` → Security → 2-Step Verification → App passwords.

---

## 4. Database Schema

Database: Neon Postgres. Run migrations via Node.js script (no `psql`, no `neonctl sql`).

### `members`
```sql
create table if not exists members (
  id            uuid default uuid_generate_v4() primary key,
  first_name    text not null,
  last_name     text not null,
  name          text not null,           -- full name: first_name || ' ' || last_name
  email         text not null unique,
  password_hash text not null,           -- bcrypt 12 rounds
  created_at    timestamptz default now()
);
```

### `otps`
Used for signup OTP verification. The `code` field stores a JSON blob (not just the 6-digit code) containing pending account data before the account is created.
```sql
create table if not exists otps (
  id         uuid default uuid_generate_v4() primary key,
  email      text not null,
  code       text not null,              -- JSON: { code, firstName, lastName, passwordHash }
  expires_at timestamptz not null,
  used       boolean default false,
  created_at timestamptz default now()
);
```

### `password_resets`
```sql
create table if not exists password_resets (
  id         uuid default uuid_generate_v4() primary key,
  email      text not null,
  token      text not null,              -- 32-byte hex (randomBytes(32).toString('hex'))
  expires_at timestamptz not null,       -- 1 hour from creation
  used       boolean default false,
  created_at timestamptz default now()
);
```

### `products`
```sql
create table if not exists products (
  id           uuid default uuid_generate_v4() primary key,
  name         text not null,
  slug         text not null unique,
  tagline      text,
  description  text,
  url          text,
  maker_name   text,
  maker_email  text,
  category     text,
  tags         text[],
  stage        text,                     -- 'Idea' | 'In Progress' | 'Launched'
  approved     boolean default true,     -- immediately live, no moderation queue
  created_at   timestamptz default now()
);
```

### `comments`
`rating` is nullable — old comments have `NULL`, new reviews require 1–5.
```sql
create table if not exists comments (
  id           uuid default uuid_generate_v4() primary key,
  product_slug text not null references products(slug) on delete cascade,
  author_name  text not null,
  author_email text not null,
  body         text not null,
  rating       smallint check (rating >= 1 and rating <= 5),   -- added; nullable for old rows
  created_at   timestamptz default now()
);
```

### `product_likes`
One row per member per product. UNIQUE constraint enforces the toggle at DB level.
```sql
create table if not exists product_likes (
  id           uuid default uuid_generate_v4() primary key,
  product_slug text not null references products(slug) on delete cascade,
  member_email text not null references members(email) on delete cascade,
  created_at   timestamptz default now(),
  constraint product_likes_unique unique (product_slug, member_email)
);
```

### `blog_posts`
Posts created via the web editor (admin only). Filesystem posts in `content/blog/` are NOT in this table.
```sql
create table if not exists blog_posts (
  id           uuid default gen_random_uuid() primary key,
  slug         text unique not null,
  title        text not null,
  description  text default '',
  content      text not null default '',
  tags         text[] default '{}',
  published    boolean default false,
  published_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
```

---

## 5. Auth System

### Session
- JWT signed with HS256 using `JWT_SECRET`
- Stored in cookie `cg_session` (httpOnly, Secure, SameSite=lax, maxAge=30 days)
- Payload: `{ email: string, name: string }`

### Signup flow (two-step OTP)
1. User fills form (firstName, lastName, email, password) → POST `/api/members/join`
2. Server hashes password, stores JSON in `otps.code`, sends 6-digit OTP email
3. User enters code → POST `/api/auth/verify-signup-otp`
4. Server verifies code, parses JSON from `otps.code`, inserts into `members`, sets cookie

### Sign-in flow (password)
1. POST `/api/auth/signin` with `{ email, password }`
2. bcrypt.compare against `members.password_hash`
3. On success: sign JWT, set `cg_session` cookie

### Forgot password flow
1. POST `/api/auth/forgot-password` → generates 32-byte hex token, stores in `password_resets` (1hr expiry), emails reset link
2. User clicks `${SITE_URL}/reset-password?token=xxx`
3. POST `/api/auth/reset-password` → validates token, hashes new password, updates member

### Admin check
Admin is identified purely by email match: `session.email === 'divyaraj.murugan@curiousgeekspm.com'`. This constant lives in `lib/posts.ts` as `ADMIN_EMAIL`.

---

## 6. File Structure Index

```
/
├── app/
│   ├── layout.tsx                  Root layout — imports NavWrapper (server), Space Grotesk font
│   ├── page.tsx                    Homepage — hero, stat cards (members/products/posts), product grid, blog grid
│   ├── globals.css                 Tailwind + CSS animations (badgeIn, blink, orbFloat1/2/3, prose styles)
│   │
│   ├── blog/
│   │   ├── page.tsx                Blog listing — shows "Write post" button if admin
│   │   ├── [slug]/page.tsx         Blog post — shows "Edit post" button if admin, MDXRemote render
│   │   ├── new/page.tsx            New post editor — admin only, @uiw/react-md-editor, saves to DB
│   │   └── edit/[slug]/page.tsx    Edit post editor — admin only, fetches from DB, save/unpublish
│   │
│   ├── join/page.tsx               Signup — 3-step: form → OTP → done (client component)
│   ├── signin/page.tsx             Sign in — email + password (wrapped in Suspense for useSearchParams)
│   ├── forgot-password/page.tsx    Forgot password — email input, fire-and-forget email
│   ├── reset-password/page.tsx     Reset password — reads ?token= param (wrapped in Suspense)
│   ├── privacy/page.tsx            Privacy policy — static page
│   │
│   ├── products/
│   │   ├── page.tsx                Products listing — queries ProductWithStats (like_count + avg_rating subqueries)
│   │   ├── [slug]/page.tsx         Product detail — LikeButton, avg rating display, reviews section
│   │   └── submit/page.tsx         Submit product form — auth-gated (middleware + API)
│   │
│   └── api/
│       ├── auth/
│       │   ├── signin/route.ts         POST { email, password } → set cookie
│       │   ├── signout/route.ts        POST → clear cookie
│       │   ├── me/route.ts             GET → return session payload or 401
│       │   ├── forgot-password/route.ts POST { email } → send reset email (always returns ok)
│       │   ├── reset-password/route.ts POST { token, password } → update password
│       │   ├── verify-signup-otp/route.ts POST { email, code } → create member, set cookie
│       │   ├── send-otp/route.ts       POST { email } → legacy OTP sign-in (unused)
│       │   └── verify-otp/route.ts     POST { email, code } → legacy OTP sign-in (unused)
│       │
│       ├── members/
│       │   └── join/route.ts       POST { firstName, lastName, email, password } → send OTP
│       │
│       ├── products/
│       │   ├── submit/route.ts     POST product data → insert (auth-gated)
│       │   └── [slug]/
│       │       └── like/route.ts   POST → toggle like; returns { liked, count }
│       │
│       ├── comments/
│       │   └── route.ts            GET ?productSlug= | POST { productSlug, body, rating } (auth-gated)
│       │
│       └── blog/
│           ├── route.ts            POST (create) | PATCH (update) — admin only
│           └── [slug]/route.ts     GET single post for editor — admin only
│
├── components/
│   ├── Nav.tsx                     Client component — accepts session prop, shows UserAvatar if logged in
│   ├── NavWrapper.tsx              Server component — reads cookie, passes session to Nav
│   ├── CommentSection.tsx          Client component — review form (stars required) or sign-in prompt
│   ├── StarRating.tsx              Client component — dual-mode: display (5 filled stars) or input (interactive picker)
│   ├── LikeButton.tsx              Client component — heart toggle with optimistic update; display-only if no session
│   ├── TableOfContents.tsx         Client component — sticky TOC with IntersectionObserver; highlights active heading on scroll
│   ├── ProductCard.tsx             Product card UI — shows like count + avg rating in footer
│   ├── BlogCard.tsx                Blog card UI
│   └── Footer.tsx                  Footer with Privacy Policy link
│
├── lib/
│   ├── auth.ts                     signSession, verifySession, getSession (server), getSessionFromCookieHeader, sessionCookieOptions, clearCookieOptions
│   ├── db.ts                       Neon sql tagged-template export
│   ├── email.ts                    sendWelcomeEmail, sendOtpEmail, sendPasswordResetEmail, sendSignupOtpEmail
│   ├── posts.ts                    getAllPosts (fs+db), getPostBySlug (fs+db), getAllPostsAdmin, getPostBySlugAdmin, ADMIN_EMAIL
│   └── types.ts                    PostMeta, Product, ProductWithStats, Comment TypeScript types
│
├── content/
│   └── blog/                       Markdown files — slug = filename. Read at build/request time via fs
│       └── how-to-become-a-product-manager.md
│
├── middleware.ts                   Protects /products/submit — redirects to /signin?from=... if no session
├── db/schema.sql                   Full schema — for reference only (run migrations via Node.js scripts)
├── scripts/
│   └── test-email.mjs              Run: node scripts/test-email.mjs your@email.com — tests SMTP
└── public/
    └── blog/                       Images for blog posts — reference as /blog/image.jpg in markdown
```

---

## 7. API Routes Index

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/members/join` | None | Step 1 signup: validate, hash password, send OTP |
| POST | `/api/auth/verify-signup-otp` | None | Step 2 signup: verify OTP, create member, set cookie |
| POST | `/api/auth/signin` | None | Password sign-in, set cookie |
| POST | `/api/auth/signout` | None | Clear cookie |
| GET | `/api/auth/me` | Cookie | Return `{ email, name }` or 401 |
| POST | `/api/auth/forgot-password` | None | Send reset email (always returns ok) |
| POST | `/api/auth/reset-password` | None | Validate token, update password |
| GET | `/api/comments?productSlug=` | None | Fetch reviews for a product |
| POST | `/api/comments` | Cookie (member) | Post review — body `{ productSlug, body, rating }`, rating 1–5 required |
| POST | `/api/products/[slug]/like` | Cookie (member) | Toggle like — returns `{ liked: boolean, count: number }` |
| POST | `/api/products/submit` | Cookie (member) | Submit product |
| POST | `/api/blog` | Cookie (admin) | Create blog post |
| PATCH | `/api/blog` | Cookie (admin) | Update blog post |
| GET | `/api/blog/[slug]` | Cookie (admin) | Fetch post data for editor |

---

## 8. Blog System — Dual Source

Posts come from two places, merged in `lib/posts.ts`:

1. **Filesystem** (`content/blog/*.md`) — written manually or via Obsidian. Frontmatter: `title`, `description`, `date`, `tags[]`.
2. **Database** (`blog_posts` table) — written via the web editor at `/blog/new`.

`getAllPosts()` merges both, sorted by date descending. `getPostBySlug()` checks filesystem first, then DB.

**`generateStaticParams` in `app/blog/[slug]/page.tsx` only reads filesystem** — DB posts render on demand. This avoids Neon connection failures during Vercel build (Neon free tier auto-pauses).

**Admin editor:** `/blog/new` and `/blog/edit/[slug]` — only visible/accessible when `session.email === ADMIN_EMAIL`. Editor uses `@uiw/react-md-editor` (must be dynamically imported: `dynamic(() => import('@uiw/react-md-editor'), { ssr: false })`).

---

## 9. Key Gotchas

### Neon + `channel_binding`
`DATABASE_URL` must end with `?sslmode=require` only. Adding `&channel_binding=require` causes `TypeError: fetch failed` in `@neondatabase/serverless`. This was the source of the "not running locally" bug.

### Neon auto-pause
Neon free tier pauses after ~5 min inactivity. First request after pause fails with `fetch failed`. Second request succeeds. On Vercel this shows as a cold-start 500. Solution: not much you can do on free tier — it auto-resumes within 1–2 seconds.

### `useSearchParams()` requires Suspense
Any page using `useSearchParams()` in Next.js 14 App Router must wrap the component using it in `<Suspense>`. Affects: `app/signin/page.tsx`, `app/reset-password/page.tsx`. Pattern:
```tsx
function InnerForm() { const p = useSearchParams(); ... }
export default function Page() { return <Suspense><InnerForm /></Suspense> }
```

### Server component icon imports
`@phosphor-icons/react` must be imported from `/dist/ssr` in server components:
```tsx
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'  // server component
import { ArrowLeft } from '@phosphor-icons/react'            // client component
```

### `jose` + Edge Runtime warning
The middleware uses `getSessionFromCookieHeader` from `lib/auth.ts` which imports `jose`. This causes a build warning about `CompressionStream` not being available in Edge Runtime. It's a warning, not an error — the middleware still works correctly.

### `next-mdx-remote` version
Must be v6+. Vercel blocks v5 with a security error at deploy time. Import for RSC: `import { MDXRemote } from 'next-mdx-remote/rsc'`.

### `@uiw/react-md-editor` SSR
Must use dynamic import in client components. Also requires CSS imports:
```tsx
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
```
Wrap the editor div with `data-color-mode="light"` to prevent dark mode flash.

### `ProductWithStats` vs `Product`
`ProductCard` and any query that returns products for listing must use `ProductWithStats` (extends `Product` with `like_count: number` and `avg_rating: number | null`). This applies to `app/products/page.tsx` and `app/page.tsx`. The `app/products/[slug]/page.tsx` detail page still uses plain `Product` for the single-product fetch — like data is fetched separately.

### Like toggle is a POST, not PUT/DELETE
`POST /api/products/[slug]/like` handles both directions — it reads the existing row and either inserts or deletes. The `on conflict do nothing` clause on insert guards against race conditions. The UNIQUE constraint `(product_slug, member_email)` enforces one like per member at the DB level.

### Neon timestamps are JS Date objects — never use `String(date).slice(0,10)`
`@neondatabase/serverless` returns Postgres `timestamp` and `timestamptz` columns as JS `Date` objects, not strings. `String(new Date()).slice(0,10)` gives `"Thu May 28"` which JavaScript's `Date` constructor parses as year 2001 (or an unpredictable year). Always use `.toISOString().slice(0,10)` to extract `YYYY-MM-DD`. Also: `new Date("YYYY-MM-DD")` is UTC midnight — parse it as local time with `new Date(y, m-1, d)` to avoid off-by-one day shifts in date display.

### Star rating is required for new reviews, nullable for old
`comments.rating` is `SMALLINT NULL`. The API enforces `1 ≤ rating ≤ 5` for new submissions. Old comments (pre-feature) have `rating = NULL` and display without a star row in `CommentItem` — no migration needed.

### `calc()` in Tailwind
Use underscores for spaces inside `calc()`: `rounded-[calc(1.75rem_-_6px)]` not `calc(1.75rem-6px)`.

### Git credentials
The GitHub repo (`Divyaraj-M/curiousgeeks`) requires a **classic PAT** with `repo` scope for git push. Fine-grained PATs fail for HTTPS git push even if the REST API shows `push: true`. macOS keychain (`osxkeychain`) takes precedence over other credential helpers — clear with `security delete-internet-password -s github.com` if needed.

---

## 10. Design System

**Colors:**
- Brand: `#F26B3A` (persimmon orange) / OKLCH: `oklch(0.69 0.176 41)`
- Text: `#18181A` (near-black)
- Muted: `#8A8A85`
- Surface: `#FAFAF6` (warm white)
- Border: `#E8E4DC`
- Card bg: `#F5F1E8`

**Card pattern (double-bezel):**
```html
<div class="p-[6px] rounded-[1.75rem] bg-[#F5F1E8] border border-[#E8E4DC]">
  <div class="bg-white rounded-[calc(1.75rem_-_6px)] px-6 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
    ...
  </div>
</div>
```

**Animations (defined in `app/globals.css`):**
- `badgeIn` — logo badge entrance (slide + fade)
- `blink` — mascot eye blink (scaleY)
- `orbFloat1/2/3` — hero background orb drift
- Classes: `.badge-c`, `.badge-g`, `.cg-eye`, `.cg-eye-b`, `.orb-1`, `.orb-2`, `.orb-3`

---

## 11. Deployment

**Vercel project:** `divyaraj-ms-projects/website`  
**Auto-deploy:** Every push to `main` triggers a production deployment.  
**Manual deploy:** `vercel --prod` from project root (requires `vercel` CLI logged in as `divyaraj-m`).

**DNS (Squarespace):**
- `A @ → 76.76.21.21` (Vercel)
- `CNAME www → cname.vercel-dns.com`
- TXT records for Google Workspace email (SPF + DKIM) — do not touch
- MX record `smtp.google.com` — do not touch

**To update an env var on Vercel:**
```bash
vercel env rm VAR_NAME production --yes
vercel env add VAR_NAME production <<< "new-value"
vercel --prod
```

---

## 12. Running Locally

```bash
npm run dev         # starts on http://localhost:3000
```

If port 3000 is busy: `lsof -ti:3000 | xargs kill -9`

Test email SMTP: `node scripts/test-email.mjs your@email.com`

Push to production:
```bash
git add -A
git commit -m "your message"
git push origin main   # Vercel auto-deploys
```

---

## 13. Changelog

> Append one entry per feature or bug fix. Format: `YYYY-MM-DD — What changed — Why / notes`

**2026-05-27** — Initial site launch — Next.js 14, Neon Postgres, email OTP auth, products, comments, blog (fs + DB), deployed to Vercel on curiousgeekspm.com.

**2026-05-28** — Added live member count stat card to homepage hero — alongside product count and blog count.

**2026-05-28** — Built inline blog editor (admin-only) — "Write post" on `/blog`, "Edit post" on `/blog/[slug]`, visible only to `divyaraj.murugan@curiousgeekspm.com`. Uses `@uiw/react-md-editor` with `dynamic({ ssr: false })`. Saves to `blog_posts` table.

**2026-05-28** — Added product likes and review star ratings — `product_likes` table (toggle API at `POST /api/products/[slug]/like`), `rating` column on `comments` (1–5, required for new reviews). `StarRating` (display + input) and `LikeButton` (optimistic) components. Like count + avg rating on product cards and detail page.

**2026-05-28** — Fixed blog post date showing wrong year (2001 instead of 2026) — Root cause: Neon returns `timestamp` columns as JS `Date` objects; `String(dateObj).slice(0,10)` gives `"Thu May 28"` which JS parses as year 2001. Fix: use `.toISOString().slice(0,10)` in `lib/posts.ts`. Also fixed UTC midnight shift in blog post page by parsing `YYYY-MM-DD` in local time.

**2026-05-28** — Added sticky TOC sidebar and related articles to blog post pages — `TableOfContents` client component uses `IntersectionObserver` to highlight active heading. Custom `h1/h2/h3` MDX components add slug IDs. Related articles: posts sharing ≥1 tag with current post, sorted by overlap count, capped at 5. Layout is two-column on `xl:` screens.

**2026-05-28** — Added favicon (`app/icon.svg`) — dark rounded-square with serif "G" in brand orange (`#F26B3A`).

**2026-05-28** — Replaced favicon with actual CG mascot logo SVG — uses exact SVG paths from the nav component (orange C badge + cream G badge overlapping) on warm `#FAFAF6` background.

**2026-05-28** — Added blog post comments (discussion) — `blog_comments` table, `GET/POST /api/blog-comments`, `BlogCommentSection` client component below each article. Sidebar shows discussion count pill + "Write a comment →" jump link. Tags shown as pills below TOC in sidebar.
