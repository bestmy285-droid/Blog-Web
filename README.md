# Blog Web

A fast, accessible personal blog built with Astro. Content lives in Markdown/MDX, every page is generated at build time, and the site ships as static HTML with no database or runtime server.

## Requirements

- Node.js **22.23.4 or newer** (Node 24 LTS recommended)
- npm 10 or newer

The repository includes `.nvmrc` and `.node-version` for version managers. CI uses Node 24.

## Quick start

```sh
npm install
npm run dev
```

The dev server prints a local URL, usually `http://localhost:4321`.

```sh
npm run build      # validates content, then builds to dist/
npm run preview    # serves the production build locally
npm test           # content validation + Astro type/diagnostic checks
npm run validate   # content validation only
npm run check      # Astro check only
```

`npm run build` automatically runs `validate` through the `prebuild` hook. A failed validation never produces a deployable build.

## Writing a post

Create a file in `src/content/posts/`, for example `my-new-post.mdx`:

```mdx
---
title: "My new post"
date: 2026-10-22
summary: "One or two sentences shown on cards, in search, and in the RSS feed."
tags: ["astro", "writing"]
---

The body starts here.
```

The file name becomes the URL: `my-new-post.mdx` → `/posts/my-new-post/`.

### Frontmatter

| Field | Required | Rules |
| --- | --- | --- |
| `title` | Yes | 1–120 characters |
| `date` | Yes | ISO date, e.g. `2026-10-22` |
| `summary` | Yes | 1–200 characters |
| `tags` | Yes | Array, maximum 5; use `[]` for none |
| `updated` | No | ISO date; shows as the modified date |
| `cover` | No | Relative image path, e.g. `../../assets/cover.png` |
| `coverAlt` | With `cover` | Required, non-empty description |
| `draft` | No | `true` hides the post from production |
| `slug` | No | Overrides the file-name slug |

Tags are normalized to lowercase kebab-case. More than five tags, duplicate slugs, broken internal links, missing images, and missing alt text fail the build.

### Drafts

Set `draft: true` to preview a post locally. Drafts appear in `npm run dev` with a **Draft** badge and are excluded from the production build, search index, RSS, sitemap, tag counts, and related posts.

### Images

Put content images in `src/assets/` and reference them relatively from the post. Astro optimizes them at build time. Public files such as the favicon and avatar live in `public/`.

Always provide alt text. Use `alt=""` only for a decorative image in raw HTML.

## Project structure

```text
src/
├── assets/                 # optimized content images
├── components/             # header, footer, cards, SEO, TOC, share
├── content/
│   ├── pages/about.mdx     # About page content
│   └── posts/              # blog posts
├── layouts/                # base and post layouts
├── lib/                    # post, tag, date, and search helpers
├── pages/                  # routes, RSS, sitemap, robots, search index
├── styles/global.css       # design tokens and all site styles
├── consts.ts               # site title, description, author, social links
└── content.config.ts       # collection loaders and schemas
scripts/validate-content.mjs
RFP/                        # requirement and task-case documents
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home feed, 10 posts per page |
| `/page/2/` | Older posts |
| `/posts/<slug>/` | Post page |
| `/tags/` | Tag index |
| `/tags/<tag>/` | Posts for one tag |
| `/archive/` | All posts grouped by year |
| `/about/` | About page |
| `/search/` | Client-side full-text search |
| `/rss.xml` | RSS 2.0 feed |
| `/sitemap.xml` | Sitemap |
| `/robots.txt` | Crawler rules |
| `/404/` | Custom not-found page |

## Configuration before launch

Update these placeholders:

1. `astro.config.mjs` — replace `https://blog-web.example.com` with the real domain.
2. `src/consts.ts` — site title, tagline, description, author name, email, social links.
3. `src/content/pages/about.mdx` — real bio and contact links.
4. `public/avatar.svg`, `public/favicon.svg`, and `public/og-default.png` — real brand assets.
5. `src/assets/cover-default.png` — replace or remove the sample cover.
6. `public/og-default.png` — regenerate at 1200×630 for social previews.

The sitemap, canonical URLs, RSS links, and Open Graph URLs all derive from `site` in `astro.config.mjs`, so keep the domain consistent.

## Deployment

The build output is the `dist/` directory. Any static host works.

### Vercel

- Import the repository.
- Framework preset: Astro.
- Build command: `npm run build`.
- Output directory: `dist`.

### Netlify

- Build command: `npm run build`.
- Publish directory: `dist`.
- Node version: 24 (set in the build environment or `.nvmrc`).

### Cloudflare Pages

- Build command: `npm run build`.
- Build output directory: `dist`.
- Node version: 24.

### GitHub Pages

Set `site` to the Pages URL and add `base` if the site is served from a repository subpath. Then publish `dist/` with a Pages workflow or a static-site action.

A host connected to `main` deploys automatically after CI. A failed build leaves the previous deployment live, and the host's deployment history provides rollback.

## CI

`.github/workflows/ci.yml` runs on pushes to `main` and on pull requests:

1. `npm ci`
2. `npm audit --audit-level=high`
3. `npm test` (content validation + `astro check`)
4. `npm run build`
5. Uploads `dist/` as an artifact

## Quality targets

- Lighthouse mobile Performance, Accessibility, SEO, and Best Practices ≥95.
- LCP ≤2.0 s, CLS <0.1, INP <200 ms.
- WCAG 2.1 AA: keyboard support, visible focus, semantic landmarks, contrast.
- Initial JavaScript ≤150 KB gzip.
- No cookies or third-party trackers; the only stored preference is the theme.
- Content and navigation remain readable without JavaScript. Search requires JavaScript.

## Testing

The full requirement and 41-case test plan are in:

- `RFP/requirement.md`
- `RFP/taskcase.md`

### Automated checks

```sh
npm test          # content validation + astro check
npm run test:e2e  # build, then run the 41 Playwright cases
npm run test:all  # npm test + Playwright
npm run test:e2e:report
```

The Playwright suite maps each test title to its `TC-###` ID. Every run writes evidence to:

```text
test-results/
├── blog-TC-001-.../
│   ├── test-finished-1.png
│   ├── video.webm
│   └── trace.zip
├── ...
└── results.json
playwright-report/index.html
```

Each test also attaches a full-page screenshot and a small context JSON. Open the HTML report with `npm run test:e2e:report`, or inspect a single trace with:

```sh
npx playwright show-trace test-results/<test-folder>/trace.zip
```

The suite uses the installed Chrome channel, so no Playwright browser download is required. Cases that need a zero-post build (`TC-002`) and the dev server (`TC-008`) create their own temporary environment and restore the full build afterwards.

Automated checks cover content validation, duplicate slugs, broken internal links, image references, alt text, Astro diagnostics, routing, search, RSS/sitemap metadata, theme persistence, keyboard access, no-JS rendering, privacy, and responsive viewports. Lighthouse accessibility/SEO/best-practices audits were also run separately; both light and dark themes scored 100.

## Content model notes

- Search uses a prebuilt `/search-index.json` loaded only on the search page. It contains the full body text of published posts; for a large archive, consider trimming the indexed body or switching to a section-level index.
- Drafts are visible only during local development. Production filtering happens at build time.
- The theme is resolved by a tiny inline script before first paint, then a class toggle drives CSS variables.
- Shiki uses dual light/dark themes. Code copy and TOC highlighting are progressive enhancement.
