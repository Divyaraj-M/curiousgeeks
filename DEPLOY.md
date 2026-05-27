# Deploy Guide — Curious Geeks Website

Get the site live in ~15 minutes. You'll need accounts on Neon and Vercel (both free tiers work fine).

---

## 1. Neon setup

The fastest way is the CLI:

```bash
npx neonctl@latest init --agent cursor
```

This authenticates with Neon in your browser, creates a project, and installs the Neon agent skill + extension for Cursor.

Then apply the schema:

```bash
node --env-file=.env.local -e "
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const sql = neon(process.env.DATABASE_URL);
const cleaned = fs.readFileSync('db/schema.sql', 'utf8')
  .split('\n').filter(l => !l.trim().startsWith('--')).join('\n');
const stmts = cleaned.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
(async () => {
  for (const s of stmts) { try { await sql.query(s); console.log('OK'); } catch (e) { console.error('FAIL', e.message); } }
})();
"
```

Or paste the contents of `db/schema.sql` into the **SQL Editor** in the [Neon console](https://console.neon.tech).

Grab your connection string:

```bash
npx neonctl@latest connection-string
```

Save it to `.env.local` as `DATABASE_URL` (this file is gitignored).

---

## 2. Tally forms

You need three forms. Each connects to your Google Sheet — see `automation/SETUP.md` for the full form field specs.

After creating each form in [tally.so](https://tally.so):
- Copy the form URL (looks like `https://tally.so/r/abc123`)
- You'll add these to Vercel env vars in step 4

| Form | Env var |
|------|---------|
| Join Community | `NEXT_PUBLIC_TALLY_JOIN_FORM_URL` |
| Submit Product | `NEXT_PUBLIC_TALLY_PRODUCT_FORM_URL` |
| Add Comment | `NEXT_PUBLIC_TALLY_COMMENT_FORM_URL` |

---

## 3. Push to GitHub

```bash
cd website
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on GitHub (e.g. `curious-geeks-site`) and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/curious-geeks-site.git
git push -u origin main
```

---

## 4. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Add New Project → Import from GitHub
2. Select your `curious-geeks-site` repo
3. Framework preset: **Next.js** (auto-detected)
4. Under **Environment Variables**, add:

```
DATABASE_URL
NEXT_PUBLIC_TALLY_JOIN_FORM_URL
NEXT_PUBLIC_TALLY_PRODUCT_FORM_URL
NEXT_PUBLIC_TALLY_COMMENT_FORM_URL
```

Tip: Vercel has a native Neon integration — visit **Storage → Add Database → Neon** to link the project and have `DATABASE_URL` injected automatically across all environments.

5. Click **Deploy**

Your site will be live at `https://curious-geeks-site.vercel.app` (or your custom domain).

---

## 5. Writing new blog posts

Drop a new `.md` file into `website/content/blog/`:

```markdown
---
title: "Your Post Title"
description: "One-line summary shown in cards."
date: "2026-06-01"
tags:
  - product-thinking
  - hot-take
---

Your post content here...
```

Then push to GitHub — Vercel auto-deploys on every push.

**Slug** is derived from the filename. `my-new-post.md` → `/blog/my-new-post`.

---

## 6. Connecting Apps Script to Neon (optional)

The Google Apps Script in `automation/Code.gs` currently writes product pages as `.md` files to GitHub, which the Obsidian Git plugin then pulls into your vault.

If you also want products to appear on the website automatically (without waiting for manual inserts), you can write to Neon via its REST-style HTTP endpoint or by calling a small `/api/ingest` route on the deployed site. Easiest path:

1. Add an `/api/ingest` POST route on the Next.js side that accepts a shared secret and inserts into `products` via `sql\`insert into products ...\``.
2. From Apps Script, `UrlFetchApp.fetch('https://your-site.vercel.app/api/ingest', { headers: { 'x-api-key': SECRET }, payload: ... })`.

Store the secret in both Vercel env vars and Apps Script Script Properties.

---

## Quick reference

| What | Where |
|------|-------|
| Blog posts | `website/content/blog/*.md` |
| Schema changes | `db/schema.sql` → re-run via Neon console or the node command above |
| Tally form fields | `automation/SETUP.md` |
| Apps Script | `automation/Code.gs` → Google Apps Script editor |
| Env vars | Vercel dashboard → Project Settings → Environment Variables |
