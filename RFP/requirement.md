# Blog Web — Personal Blog Website

| Field | Value |
| --- | --- |
| Document ID | RFP-blog-web-001 |
| Version | 1.0 |
| Date | 2026-10-22 |
| Status | Draft — v1 baseline (owner delegated feature decisions) |
| Author | OpenCode (AI assistant) |
| Owner | Blog owner (single author) |
| Stakeholders | Owner/Author, Readers, Search engines and social crawlers |
| Related documents | `RFP/taskcase.md` |

## 1. Overview

### 1.1 Background

The owner wants a personal blog to publish long-form writing, share knowledge, and build an audience. Generic publishing platforms add noise, limit presentation, and keep the content locked to their platform. This project delivers a small, fast, self-owned website where writing lives as plain files in a Git repository.

### 1.2 Problem statement

The owner has no owned space to publish polished technical or personal writing. Publishing on third-party platforms means fighting their layout, losing control of URLs and metadata, and accepting slow, ad-heavy reading experiences. Readers need a clean, accessible, mobile-friendly page that loads quickly and is easy to share.

### 1.3 Goals

| ID | Goal | Success measure |
| --- | --- | --- |
| G-01 | Publish a post from a local Markdown file to the live site in 10 minutes or less, excluding writing time | Timed dry run from commit to live URL completes in ≤10 minutes |
| G-02 | Give readers a fast, accessible, distraction-free reading experience | Lighthouse mobile Performance and Accessibility ≥95; LCP ≤2.0 s |
| G-03 | Make posts discoverable through search engines, social previews, RSS, and on-site search | Every published post appears in the sitemap and RSS; metadata validates |
| G-04 | Keep content portable and owned by the author | Full content export is a copy of the `content/` directory; no database required |

### 1.4 Non-goals

- Multi-author accounts, guest posts, or editorial roles.
- Comments, likes, reactions, or user accounts for readers.
- Newsletter collection, paid subscriptions, or e-commerce.
- A browser-based CMS or admin dashboard.
- Native mobile applications.
- Multi-language routing or translated UI.
- Analytics dashboards, advertising, or affiliate systems.
- Contact forms that require a backend.

## 2. Users and roles

| Role | Description | Key permissions |
| --- | --- | --- |
| Owner / Author | The single person who writes, publishes, and maintains the site | Create, edit, preview, publish, unpublish, and delete posts through the Git repository; edit About content and site settings |
| Reader | Anonymous visitor | Browse, search, read, follow links, copy/share URLs, and subscribe via RSS |
| Crawler | Search engine or social platform bot | Read public HTML, sitemap, RSS, and social metadata |

There is no runtime login and no admin account in v1. Authoring happens through the repository and local preview.

## 3. Scope

### 3.1 In scope

- Public home feed with the latest posts and pagination.
- Post pages rendered from Markdown/MDX with frontmatter.
- Tags index, tag pages, archive, About, and custom 404.
- Client-side search across published posts.
- RSS feed, sitemap, robots.txt, canonical URLs, social metadata, and `BlogPosting` structured data.
- Responsive reading layout, light/dark theme, table of contents, reading time, syntax highlighting, and copy-code.
- Share actions using the Web Share API and clipboard.
- Content validation in CI and automated deployment from the main branch.

### 3.2 Out of scope

- Comments, newsletter, reader accounts, and gated content.
- A web-based editor or CMS.
- Server-side personalization, databases, and runtime APIs.
- Scheduled publishing without a rebuild. Future-dated posts are not part of v1.
- Analytics that set cookies or load third-party scripts before user action.
- Multi-language UI, translations, and right-to-left layout support.

### 3.3 Key user flows

1. **Publish:** The author creates `content/posts/<slug>.mdx`, fills the frontmatter, runs the local preview, commits, and pushes. CI validates the content, builds the site, and deploys it to the live URL.
2. **Read:** A reader lands on the home feed, scans the ten newest posts, opens a post, reads it, uses the table of contents, and shares the canonical URL.
3. **Find:** A reader searches for a topic, gets ranked matches with excerpts, opens a result, and continues through a tag or related post.
4. **Subscribe:** A reader discovers the RSS link in the page head or footer and subscribes in their feed reader.

## 4. Functional requirements

**Priority scale:** Must = the first release cannot ship without it; Should = important but deferrable; Could = nice to have.

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| REQ-F-01 | Home feed | Must | The home page lists the 10 most recent published posts, newest first. Each card shows title, publish date, summary, tags, and reading time. When no posts are published, the page shows an empty-state message and a link to About. |
| REQ-F-02 | Post page | Must | Each published post is available at a stable slug URL and renders the MDX body, title, publish date, author, tags, and reading time. An unknown slug, or a slug that exists only as a draft, returns HTTP 404 with the custom 404 page. |
| REQ-F-03 | Content format and frontmatter | Must | Posts are `.mdx` files with YAML frontmatter. Required fields: `title` (1–120 characters), `date` (ISO date), `summary` (1–200 characters), and `tags` (0–5 items). Optional fields: `updated`, `cover`, `coverAlt`, `draft`. A missing or invalid required field fails the build with the file path and field name. |
| REQ-F-04 | Draft workflow | Must | A post with `draft: true` is excluded from production HTML, search index, RSS, sitemap, tag counts, and related posts. In local development it renders normally with a visible "Draft" badge. Published posts are unaffected. |
| REQ-F-05 | Tags | Must | The tag index lists every tag used by at least one published post, with its published-post count, sorted alphabetically. A tag page lists matching published posts newest first. Tags are case-insensitive, trimmed, and normalized to lowercase kebab-case; more than five tags per post fails the build. An unknown tag returns 404. |
| REQ-F-06 | Search | Must | Site search matches title, summary, tags, and body text, case-insensitively and diacritic-insensitively. Results show title, date, and a matched excerpt. An empty query shows recent posts; no match shows "No results" plus suggested tags. Search is fully keyboard-operable and works from a prebuilt index without a network request after page load. |
| REQ-F-07 | Archive | Should | The archive page lists every published post grouped by year, newest year first, with month/day and title. Each entry links to its post. |
| REQ-F-08 | About page | Must | The About page renders the owner's bio, a profile image with alt text, and contact links (email plus at least one social profile). Its content is editable in a single Markdown/MDX file without code changes. |
| REQ-F-09 | RSS feed | Must | `/rss.xml` is valid RSS 2.0 with channel title, description, site link, and the 20 most recent published posts. Item links and GUIDs are absolute. The page head advertises the feed with `<link rel="alternate" type="application/rss+xml">`. |
| REQ-F-10 | Sitemap and robots | Must | `/sitemap.xml` lists canonical URLs for the home page, About, Archive, tag pages, and every published post, excluding drafts and 404 pages. `/robots.txt` allows crawling and references the absolute sitemap URL. |
| REQ-F-11 | SEO and social metadata | Must | Every page has a unique title and meta description (≤160 characters), a canonical URL, Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`), and Twitter card tags. Every post includes valid `BlogPosting` JSON-LD with headline, datePublished, author, and image. |
| REQ-F-12 | Reading layout | Must | The layout is responsive from 320 px to 1920 px with no horizontal scroll. Body text measure is 60–75 characters per line at widths of 1024 px and above. Images scale to their container, preserve aspect ratio, and require non-empty alt text unless explicitly decorative (`alt=""`). Code blocks are syntax-highlighted and include a copy button. |
| REQ-F-13 | Theme | Should | The default theme follows `prefers-color-scheme`. A toggle switches between light and dark, and the choice persists across reloads. The first paint matches the resolved theme with no visible flash of the wrong theme. |
| REQ-F-14 | Table of contents | Should | Posts with two or more H2/H3 headings show a table of contents with working anchor links. The current section is highlighted while scrolling. Heading anchors are stable and unique; duplicate heading text receives a numeric suffix. |
| REQ-F-15 | Related posts | Should | Each post shows up to three related published posts ranked by shared tags, falling back to the most recent posts when fewer than three share tags. The current post is never listed. |
| REQ-F-16 | Pagination | Should | The home feed shows 10 posts per page, with older posts at `/page/2`, `/page/3`, and so on. Page 1 is canonicalized to `/`. A non-numeric or out-of-range page returns 404. Controls expose the current page and total page count. |
| REQ-F-17 | 404 page | Must | A custom 404 page returns HTTP status 404 and shows a short message plus working links to Home, Archive, and Search. |
| REQ-F-18 | Share actions | Could | Each post offers "Copy link" and native share when the browser supports it. Copy shows a confirmation and copies the canonical URL. Native share falls back to copy when unavailable. No third-party share scripts or tracking pixels are loaded. |
| REQ-F-19 | Content validation in CI | Must | CI fails with an actionable error for missing or invalid frontmatter, duplicate slugs, broken internal links, missing image files, and posts with more than five tags. Validation runs on every push and pull request, and a failed build never deploys. |
| REQ-F-20 | Contact | Could | The About page exposes a `mailto:` link with a prefilled subject. No contact form or backend is required. |

## 5. Non-functional requirements

| ID | Category | Requirement | Target / measure |
| --- | --- | --- | --- |
| REQ-NF-01 | Performance | Fast first load and interaction on a mid-range mobile device over 4G | Lighthouse mobile Performance ≥95; LCP ≤2.0 s; CLS <0.1; INP <200 ms; initial JavaScript ≤150 KB gzip; no render-blocking third-party scripts |
| REQ-NF-02 | Accessibility | Usable with keyboard and assistive technology | WCAG 2.1 AA; every interactive element keyboard-reachable with visible focus; semantic landmarks and one visible H1 per page; text contrast ≥4.5:1; axe-core reports zero critical or serious issues; `prefers-reduced-motion` respected |
| REQ-NF-03 | SEO and crawlability | Content is readable without JavaScript and correctly indexed | Public pages ship as static HTML with content and metadata present in the initial response; metadata is unique; structured data validates; sitemap and RSS are valid |
| REQ-NF-04 | Security | No leaked secrets or common web vulnerabilities | HTTPS and HSTS on the deployed site; Content-Security-Policy, `X-Content-Type-Options: nosniff`, and a restrictive `Referrer-Policy`; no secrets in client bundles; external links use `rel="noopener noreferrer"`; no high or critical dependency advisories at release |
| REQ-NF-05 | Privacy | No tracking without consent | No analytics or advertising cookies in v1; no third-party network requests before a deliberate user action; functional storage limited to the theme preference; any future analytics must be cookieless and disclosed |
| REQ-NF-06 | Compatibility | Works on common browsers and small screens | Latest two versions of Chrome, Firefox, Safari, and Edge; iOS Safari 16+; Android Chrome 120+; no horizontal overflow at 320 px; reading and navigation work with JavaScript disabled |
| REQ-NF-07 | Availability and operations | Reliable deploys with a safe rollback | 99.9% monthly availability on static hosting; deploy from `main` in ≤5 minutes; failed builds never reach production; rollback to the previous deployment in ≤5 minutes |
| REQ-NF-08 | Maintainability | Easy to set up, extend, and hand over | Content separated from presentation; fresh clone to running site in ≤15 minutes following the README; one documented command runs lint, typecheck, tests, and build; adding a post requires no code changes |

## 6. Data and integrations

| Item | Direction | Format / protocol | Owner | Notes |
| --- | --- | --- | --- | --- |
| Posts and pages | In | Markdown/MDX with YAML frontmatter | Author | Stored in `content/posts/` and `content/pages/`; versioned in Git |
| Images | In | WebP/AVIF with JPG/PNG sources | Author | Optimized at build time; alt text required |
| Git repository | In/out | Git over HTTPS/SSH | Author | Single source of truth; every publish is a commit |
| Hosting and CDN | Out | HTTPS static hosting | Author | Free-tier host connected to the repository |
| RSS feed | Out | RSS 2.0 (`/rss.xml`) | Site | Latest 20 published posts |
| Sitemap and robots | Out | XML / plain text | Site | Generated at build time |
| Search index | Internal | Static JSON index | Site | Built from published posts only; loaded on the search page |
| Social crawlers | Out | HTML meta tags, Open Graph, JSON-LD | Site | Absolute image URLs |
| Optional analytics | Out | Cookieless script | Author | Not included in v1 |

There is no database, no application server, and no runtime authentication.

## 7. Constraints

| ID | Constraint | Reason |
| --- | --- | --- |
| REQ-C-01 | Exactly one author; no multi-user roles in v1 | Personal blog with owner-delegated scope |
| REQ-C-02 | Static output; no application server, database, or runtime auth | Simplicity, speed, security, and free-tier hosting |
| REQ-C-03 | Content lives in Git as Markdown/MDX; images live with the repository or a repository-connected store | Portability and no lock-in |
| REQ-C-04 | Zero recurring cost for v1, excluding an optional custom domain | Owner gave no budget constraint; free tier is the safe default |
| REQ-C-05 | English UI; content is UTF-8 and may include Hindi/Devanagari | Owner writes in Hindi and English; no UI translation in v1 |
| REQ-C-06 | No comments, newsletter, reader accounts, or cookie-based analytics in v1 | Keeps scope and privacy risks small |

## 8. Assumptions

- **A-01:** The owner is comfortable with Git, Markdown, and a terminal. If not, a browser-based editor becomes a v1 requirement and this plan must be revised.
- **A-02:** The owner will provide the final site title, tagline, bio, avatar, contact email, social profiles, and domain before launch.
- **A-03:** Hosting is a Git-connected static host such as Vercel, Netlify, Cloudflare Pages, or GitHub Pages. The provider is not fixed yet.
- **A-04:** There is no existing content to migrate. The site launches with at least three published posts.
- **A-05:** No paid services are required. Images are compressed at build time from owner-supplied sources.
- **A-06:** Post URLs are `/posts/<slug>` and use the slug from frontmatter or the filename. Changing a slug after publication requires a redirect, which is handled as a content decision.
- **A-07:** Legal pages such as privacy policy or imprint are only needed if analytics, ads, or newsletter features are added later.

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Git-based authoring feels heavy for a non-technical owner | Medium | High | Provide a post template, screenshot walkthrough, and one-command preview; revisit a CMS in v2 |
| SEO results take longer than expected | Medium | Medium | Submit the sitemap, add structured data and canonical URLs, and set expectations that indexing takes weeks |
| Large images hurt mobile performance | High | Medium | Enforce an image budget, optimize at build time, and warn in CI when an image exceeds the limit |
| Scope creep into comments, newsletter, or analytics | High | Medium | Keep explicit non-goals; collect these as v2 candidates and require a separate decision |
| Free-tier limits or vendor lock-in | Low | Medium | Static output remains portable; document deploy and migration steps |
| Accessibility or theme regressions over time | Medium | Medium | Automate axe and Lighthouse checks in CI; keep a theme smoke test |
| Broken links or duplicate slugs reach production | Medium | Medium | REQ-F-19 validation blocks the build and deploy |

## 10. Open questions

| # | Question | Owner | Blocks | Needed by |
| --- | --- | --- | --- | --- |
| 1 | What is the final domain, site title, and tagline? | Blog owner | Canonical URLs, metadata, branding | Before implementation |
| 2 | Which hosting provider should be used? | Blog owner | Deploy configuration and CI secrets | Before implementation |
| 3 | Are there brand assets (logo, colors, fonts) to follow? | Blog owner | Visual design | Before UI work |
| 4 | Is cookieless analytics required in v1? | Blog owner | Privacy note and script budget | Before launch |
| 5 | Are comments or a newsletter planned for v2? | Blog owner | Roadmap and data model | Before v2 planning |
| 6 | Which languages will posts use? | Blog owner | Typography, fonts, and search tokenization | Before launch |
| 7 | What contact email and social profiles should appear? | Blog owner | About page and footer | Before launch |
| 8 | What content license applies? | Blog owner | Footer and RSS metadata | Before launch |

## 11. Glossary

| Term | Meaning |
| --- | --- |
| MDX | Markdown with embedded JSX components |
| Frontmatter | YAML metadata block at the top of a content file |
| Slug | URL-safe identifier for a post |
| Static site generation (SSG) | Building HTML files ahead of time instead of rendering per request |
| RSS | XML feed format for syndicating posts |
| Canonical URL | The preferred URL for a page, used to avoid duplicate indexing |
| Open Graph | Metadata used by social platforms to build link previews |
| JSON-LD | Structured data embedded as JSON for search engines |
| LCP | Largest Contentful Paint, a loading performance metric |
| CLS | Cumulative Layout Shift, a visual stability metric |
| INP | Interaction to Next Paint, a responsiveness metric |
| WCAG 2.1 AA | Web Content Accessibility Guidelines conformance level |

## 12. Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Blog owner | Product owner | Pending | — |
| OpenCode | Authoring assistant | Draft prepared | 2026-10-22 |
