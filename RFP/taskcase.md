# Blog Web — Task Cases

| Field | Value |
| --- | --- |
| Related requirement | `RFP/requirement.md` v1.0 |
| Document ID | RFP-blog-web-TC-001 |
| Date | 2026-10-22 |
| Status | Draft |
| Environment | Node.js 22 LTS, pnpm 9, production preview build; Chrome, Firefox, Edge, Safari (latest two), iOS Safari 16+, Android Chrome 120+; Lighthouse 12, axe-core 4, NVDA and VoiceOver |
| Author | OpenCode (AI assistant) |

## 1. Purpose

Verify that every requirement in `RFP/requirement.md` is met, and that any failure can be reproduced by another person without asking questions.

## 2. Test approach

| Area | Coverage |
| --- | --- |
| Functional | Every `REQ-F-*`, happy path |
| Validation | Empty, invalid, boundary, and oversized input; content build failures |
| Permissions | Single-author model: no runtime admin access, no draft leakage |
| Integration | Hosting, RSS, sitemap, social metadata, Web Share, clipboard |
| Non-functional | Performance, accessibility, SEO, security, privacy, compatibility, operations, maintainability |

**Priority:** P0 = blocks release, P1 = important, P2 = minor.
**Status:** Not run / Pass / Fail / Blocked.

### 2.1 Conventions

- Commands assume `pnpm`; substitute the project's package manager if it differs.
- "Preview URL" means the URL printed by `pnpm preview` after `pnpm build`.
- "Production build" means `pnpm build` with `NODE_ENV=production` and no development-only content.
- Run functional cases against the production preview unless a case explicitly says `pnpm dev`.
- Use a fresh browser profile and cleared storage for theme, privacy, and share cases.

### 2.2 Test data

| ID | Fixture | Purpose |
| --- | --- | --- |
| PUB-01 | `hello-world` — published 2026-09-01, tags `typescript`, `web-dev`, 1,200 words, 6 headings including duplicate "Setup", code block, cover image with alt | Core post rendering, TOC, code copy, metadata |
| PUB-02…PUB-12 | Eleven additional published posts with distinct dates, tags, and summaries | Pagination, archive, related posts, tag counts |
| DRAFT-01 | `draft-post` — `draft: true`, unique string `DRAFT-SENTINEL-7Q2`, tag `secret-tag` | Draft exclusion and dev badge |
| TAG-NORM | Post with tags `[" TypeScript ", "typescript", "WEB dev"]` | Normalization and duplicate collapse |
| TAG-LIMIT | Post with six valid tags | Over-limit build failure |
| CAFE-01 | Published post containing "café" | Diacritic-insensitive search |
| INVALID-FM | Posts missing `title`, with `date: not-a-date`, and with a 201-character summary | Frontmatter validation |
| INVALID-LINK | Post linking to `/posts/does-not-exist` | Broken-link validation |
| DUP-SLUG | Two content files resolving to the same slug | Duplicate-slug validation |
| NO-ALT | Post image without alt text | Image accessibility validation |

### 2.3 Traceability matrix

| Requirement | Test cases |
| --- | --- |
| REQ-F-01 | TC-001, TC-002 |
| REQ-F-02 | TC-003, TC-004 |
| REQ-F-03 | TC-005, TC-006 |
| REQ-F-04 | TC-007, TC-008 |
| REQ-F-05 | TC-009, TC-010, TC-011 |
| REQ-F-06 | TC-012, TC-013 |
| REQ-F-07 | TC-014 |
| REQ-F-08 | TC-015 |
| REQ-F-09 | TC-016 |
| REQ-F-10 | TC-017 |
| REQ-F-11 | TC-018, TC-019 |
| REQ-F-12 | TC-020, TC-021 |
| REQ-F-13 | TC-022 |
| REQ-F-14 | TC-023 |
| REQ-F-15 | TC-024 |
| REQ-F-16 | TC-025, TC-026 |
| REQ-F-17 | TC-027 |
| REQ-F-18 | TC-028 |
| REQ-F-19 | TC-029, TC-030 |
| REQ-F-20 | TC-031 |
| REQ-NF-01 | TC-032, TC-033 |
| REQ-NF-02 | TC-034, TC-035 |
| REQ-NF-03 | TC-036 |
| REQ-NF-04 | TC-037 |
| REQ-NF-05 | TC-038 |
| REQ-NF-06 | TC-039 |
| REQ-NF-07 | TC-040 |
| REQ-NF-08 | TC-041 |

## 3. Functional test cases

### TC-001 — Home feed shows the ten newest published posts

| Field | Value |
| --- | --- |
| Requirement | REQ-F-01 |
| Priority | P0 |
| Type | Functional |
| Preconditions | PUB-01 through PUB-12 are published; DRAFT-01 exists; production build is running |
| Test data | PUB-01…PUB-12 |

**Steps**

1. Open `/`.
2. Count the post cards and record their titles and dates.
3. Inspect one card for title, date, summary, tags, and reading time.
4. Open the pagination control at the bottom.
5. Search the page source for `DRAFT-SENTINEL-7Q2`.

**Expected result**

- Exactly 10 cards are shown.
- Cards are ordered newest first, with no duplicates.
- Every card shows title, date, summary, at least one tag when present, and reading time.
- DRAFT-01 and its sentinel are absent.
- The "Older posts" control points to `/page/2`.

**Actual result:** —

**Status:** Not run

---

### TC-002 — Home feed shows an empty state when nothing is published

| Field | Value |
| --- | --- |
| Requirement | REQ-F-01 |
| Priority | P2 |
| Type | Boundary |
| Preconditions | Test branch where every post has `draft: true` |
| Test data | DRAFT-01 only |

**Steps**

1. Build and serve the branch.
2. Open `/`.
3. Inspect the page body, links, and browser console.

**Expected result**

- The page returns HTTP 200.
- An empty-state message is visible.
- A working link to `/about` is shown.
- No empty or broken post cards are rendered.
- No console errors appear.

**Actual result:** —

**Status:** Not run

---

### TC-003 — Post page renders content and metadata

| Field | Value |
| --- | --- |
| Requirement | REQ-F-02 |
| Priority | P0 |
| Type | Functional |
| Preconditions | PUB-01 is published; production build is running |
| Test data | PUB-01 |

**Steps**

1. Open `/posts/hello-world`.
2. Compare the displayed title, publish date, author, tags, and reading time with the frontmatter.
3. Inspect the rendered body for headings, paragraphs, links, code, and the cover image.
4. View the page source and confirm no raw frontmatter is visible.

**Expected result**

- The page returns HTTP 200.
- All metadata matches the frontmatter.
- Reading time is a whole-minute estimate consistent with the word count.
- MDX renders as formatted HTML, not raw markup.
- No raw frontmatter block appears in the body.

**Actual result:** —

**Status:** Not run

---

### TC-004 — Unknown and draft-only slugs return 404

| Field | Value |
| --- | --- |
| Requirement | REQ-F-02 |
| Priority | P1 |
| Type | Negative |
| Preconditions | DRAFT-01 exists; production build is running |
| Test data | `/posts/does-not-exist`, `/posts/draft-post` |

**Steps**

1. Request `/posts/does-not-exist`.
2. Request `/posts/draft-post`.
3. Inspect the response status and body for each.

**Expected result**

- Both requests return HTTP 404.
- Both show the custom 404 page, not a server error.
- The draft body and `DRAFT-SENTINEL-7Q2` are not present.

**Actual result:** —

**Status:** Not run

---

### TC-005 — Valid frontmatter is accepted and rendered

| Field | Value |
| --- | --- |
| Requirement | REQ-F-03 |
| Priority | P0 |
| Type | Functional |
| Preconditions | PUB-01 includes `title`, `date`, `summary`, `tags`, `cover`, `coverAlt`, and `updated` |
| Test data | PUB-01 |

**Steps**

1. Run `pnpm build`.
2. Open `/posts/hello-world`.
3. Inspect the date, updated label, tags, cover image, and alt text.
4. Confirm the summary appears in the home card and meta description.

**Expected result**

- The build succeeds.
- All required and provided optional fields render.
- An "Updated" label appears only because `updated` is present.
- The cover image uses `coverAlt` as its alt text.
- The summary matches the home card and meta description.

**Actual result:** —

**Status:** Not run

---

### TC-006 — Invalid frontmatter fails the build with an actionable error

| Field | Value |
| --- | --- |
| Requirement | REQ-F-03 |
| Priority | P0 |
| Type | Negative |
| Preconditions | INVALID-FM fixtures are on a test branch |
| Test data | Missing `title`; `date: not-a-date`; 201-character summary |

**Steps**

1. Run `pnpm build` with the missing-title fixture.
2. Repeat with the invalid-date fixture.
3. Repeat with the oversized-summary fixture.

**Expected result**

- Each build exits with a non-zero status.
- Each error message names the source file and the offending field.
- No production artifact is produced for the failing build.
- The message states the expected format or limit.

**Actual result:** —

**Status:** Not run

---

### TC-007 — Drafts are excluded from every production surface

| Field | Value |
| --- | --- |
| Requirement | REQ-F-04 |
| Priority | P0 |
| Type | Functional |
| Preconditions | DRAFT-01 has a unique sentinel and unique tag; production build is running |
| Test data | DRAFT-01 |

**Steps**

1. Search the built output for `DRAFT-SENTINEL-7Q2`.
2. Open `/`, `/tags/secret-tag`, `/rss.xml`, and `/sitemap.xml`.
3. Search the site for `DRAFT-SENTINEL-7Q2`.
4. Open PUB-01 and inspect related posts.

**Expected result**

- The sentinel does not appear in the built output.
- The draft is absent from home, tag index, RSS, sitemap, search results, and related posts.
- `/tags/secret-tag` returns 404 because no published post uses it.
- The draft URL returns 404.

**Actual result:** —

**Status:** Not run

---

### TC-008 — Drafts are previewable in development with a badge

| Field | Value |
| --- | --- |
| Requirement | REQ-F-04 |
| Priority | P1 |
| Type | Functional |
| Preconditions | `pnpm dev` is running; DRAFT-01 exists |
| Test data | DRAFT-01 |

**Steps**

1. Open the draft post URL in development mode.
2. Inspect the content and the badge.
3. Run a production build and check the draft URL again.

**Expected result**

- The development page returns HTTP 200 and renders the full draft.
- A visible "Draft" badge is shown.
- The badge meets AA contrast.
- The production build excludes the draft.

**Actual result:** —

**Status:** Not run

---

### TC-009 — Tag index lists normalized tags and counts

| Field | Value |
| --- | --- |
| Requirement | REQ-F-05 |
| Priority | P1 |
| Type | Functional |
| Preconditions | TAG-NORM and other tagged posts are published; DRAFT-01 has `secret-tag` |
| Test data | TAG-NORM, PUB-01…PUB-12, DRAFT-01 |

**Steps**

1. Open `/tags`.
2. Inspect the tag names, counts, and order.
3. Compare counts with the published posts.
4. Check for the draft-only tag.

**Expected result**

- Tags are lowercase kebab-case, with duplicates collapsed.
- Counts match published posts only.
- Tags are sorted alphabetically.
- `secret-tag` is absent.
- Every tag link resolves to a tag page.

**Actual result:** —

**Status:** Not run

---

### TC-010 — Tag page filters correctly and unknown tags return 404

| Field | Value |
| --- | --- |
| Requirement | REQ-F-05 |
| Priority | P1 |
| Type | Functional |
| Preconditions | Multiple posts use the `typescript` tag |
| Test data | PUB-01, PUB-02…PUB-12 |

**Steps**

1. Open `/tags/typescript`.
2. Compare the listed posts and count with the tag index.
3. Confirm ordering.
4. Open `/tags/does-not-exist`.

**Expected result**

- Only published posts with the tag are listed, newest first.
- The count matches the tag index.
- Drafts do not appear.
- The unknown tag returns HTTP 404 with the custom 404 page.

**Actual result:** —

**Status:** Not run

---

### TC-011 — Tag normalization and the five-tag limit are enforced

| Field | Value |
| --- | --- |
| Requirement | REQ-F-05 |
| Priority | P1 |
| Type | Boundary |
| Preconditions | TAG-NORM and TAG-LIMIT fixtures are on separate test branches |
| Test data | TAG-NORM, TAG-LIMIT |

**Steps**

1. Build the TAG-NORM branch.
2. Open its post and inspect the rendered tags and tag URLs.
3. Build the TAG-LIMIT branch.

**Expected result**

- TAG-NORM builds successfully.
- Its tags render as `typescript` and `web-dev`, with duplicates collapsed.
- TAG-LIMIT fails with an error naming the file and the five-tag maximum.
- No invalid tag URL contains uppercase letters or spaces.

**Actual result:** —

**Status:** Not run

---

### TC-012 — Search matches title, body, tags, and accents

| Field | Value |
| --- | --- |
| Requirement | REQ-F-06 |
| Priority | P1 |
| Type | Functional |
| Preconditions | PUB-01 and CAFE-01 are published; production build is running |
| Test data | PUB-01, CAFE-01 |

**Steps**

1. Open `/search`.
2. Search for `typescript`, then `TYPE`.
3. Search for `cafe`, then `café`.
4. Inspect the results and excerpts.

**Expected result**

- Both `typescript` and `TYPE` return PUB-01.
- Both `cafe` and `café` return CAFE-01.
- Results show title, date, and an excerpt containing the match.
- No draft or unpublished content appears.

**Actual result:** —

**Status:** Not run

---

### TC-013 — Search handles empty, no-result, and keyboard states

| Field | Value |
| --- | --- |
| Requirement | REQ-F-06 |
| Priority | P1 |
| Type | Functional |
| Preconditions | At least three published posts exist |
| Test data | Published fixtures |

**Steps**

1. Open `/search` and focus the input using only the keyboard.
2. Leave the query empty.
3. Type `zzzzzz`.
4. Clear the input and press Escape.
5. Navigate results with arrow keys and open one with Enter.

**Expected result**

- Tab reaches the search input and shows a visible focus ring.
- An empty query shows recent posts.
- `zzzzzz` shows "No results" and suggested tags.
- Escape clears the query and restores the default state.
- Results are navigable by keyboard, and Enter opens the focused result.

**Actual result:** —

**Status:** Not run

---

### TC-014 — Archive groups every published post by year

| Field | Value |
| --- | --- |
| Requirement | REQ-F-07 |
| Priority | P2 |
| Type | Functional |
| Preconditions | Posts span at least three calendar years |
| Test data | PUB-01…PUB-12 |

**Steps**

1. Open `/archive`.
2. Inspect the year groups and their order.
3. Compare the entries with the published post list.
4. Open two entries.

**Expected result**

- Years are ordered newest first.
- Every published post appears exactly once.
- Each entry shows month/day and title.
- Each entry links to the correct post.
- Drafts are absent.

**Actual result:** —

**Status:** Not run

---

### TC-015 — About page renders owner content without code changes

| Field | Value |
| --- | --- |
| Requirement | REQ-F-08 |
| Priority | P1 |
| Type | Functional |
| Preconditions | About content file contains bio, profile image, email, and one social link |
| Test data | About content fixture |

**Steps**

1. Open `/about`.
2. Compare the content with the source file.
3. Inspect the profile image alt text.
4. Inspect the email and social links.
5. Change one sentence in the content file, rebuild, and reload.

**Expected result**

- The page renders the bio, image, email, and social link.
- The image has non-empty alt text.
- The email uses `mailto:` and the social link opens the correct profile.
- The edited sentence appears after rebuild without code changes.

**Actual result:** —

**Status:** Not run

---

### TC-016 — RSS feed is valid and complete

| Field | Value |
| --- | --- |
| Requirement | REQ-F-09 |
| Priority | P1 |
| Type | Integration |
| Preconditions | More than 20 published posts exist |
| Test data | PUB-01…PUB-12 plus additional posts |

**Steps**

1. Open `/rss.xml`.
2. Validate it with the W3C Feed Validation Service.
3. Count the items and inspect links and GUIDs.
4. Inspect the page head for the feed autodiscovery link.

**Expected result**

- The feed is valid RSS 2.0 with no errors.
- It contains the 20 most recent published posts.
- Item links and GUIDs are absolute and unique.
- Drafts are absent.
- The head contains `<link rel="alternate" type="application/rss+xml">` with an absolute URL.

**Actual result:** —

**Status:** Not run

---

### TC-017 — Sitemap and robots.txt expose only public URLs

| Field | Value |
| --- | --- |
| Requirement | REQ-F-10 |
| Priority | P1 |
| Type | Integration |
| Preconditions | Drafts and invalid URLs exist |
| Test data | PUB-01…PUB-12, DRAFT-01 |

**Steps**

1. Open `/sitemap.xml` and validate the XML.
2. Compare its URLs with the published post list.
3. Open `/robots.txt`.
4. Request a URL that is not in the sitemap.

**Expected result**

- The sitemap is valid XML with absolute canonical URLs.
- Home, About, Archive, tag pages, and all published posts are included.
- Drafts and 404 pages are excluded.
- `robots.txt` allows crawling and references the absolute sitemap URL.
- Every sitemap URL returns HTTP 200.

**Actual result:** —

**Status:** Not run

---

### TC-018 — Metadata is unique and complete on every page

| Field | Value |
| --- | --- |
| Requirement | REQ-F-11 |
| Priority | P0 |
| Type | Functional |
| Preconditions | Home, a post, and a tag page are available |
| Test data | PUB-01, `/`, `/tags/typescript` |

**Steps**

1. Inspect the head of each page.
2. Compare titles and descriptions across pages.
3. Check the canonical URL.
4. Check `og:title`, `og:description`, `og:type`, `og:url`, `og:image`.
5. Check the Twitter card tags and request the `og:image` URL.

**Expected result**

- Each page has a unique title and a unique description of 160 characters or fewer.
- The canonical URL is self-referencing and absolute.
- All required Open Graph and Twitter tags are present.
- `og:image` is absolute and returns HTTP 200.

**Actual result:** —

**Status:** Not run

---

### TC-019 — BlogPosting structured data is valid

| Field | Value |
| --- | --- |
| Requirement | REQ-F-11 |
| Priority | P1 |
| Type | Integration |
| Preconditions | PUB-01 is published |
| Test data | PUB-01 |

**Steps**

1. Open `/posts/hello-world`.
2. Run Google Rich Results Test or Schema Markup Validator on the URL.
3. Inspect the `BlogPosting` JSON-LD block.

**Expected result**

- The validator reports no errors for `BlogPosting`.
- `headline`, `datePublished`, `author`, and `image` are present.
- Values match the visible page and canonical URL.
- No duplicate or conflicting article schema is present.

**Actual result:** —

**Status:** Not run

---

### TC-020 — Layout is responsive from 320 px to 1920 px

| Field | Value |
| --- | --- |
| Requirement | REQ-F-12 |
| Priority | P0 |
| Type | Functional |
| Preconditions | Production preview is running |
| Test data | PUB-01 |

**Steps**

1. Set the viewport to 320, 375, 768, 1024, 1440, and 1920 px.
2. Check `document.documentElement.scrollWidth` against the viewport width.
3. Measure the paragraph width at 1024 px and above.
4. Inspect navigation, images, code blocks, and tables at each width.

**Expected result**

- No horizontal scrollbar appears at any width.
- Body text measure is 60–75 characters per line at 1024 px and above.
- Navigation remains usable at 320 px.
- Images and code blocks stay inside the content column.
- No text is clipped or overlapped.

**Actual result:** —

**Status:** Not run

---

### TC-021 — Code blocks, images, and alt text meet the reading rules

| Field | Value |
| --- | --- |
| Requirement | REQ-F-12 |
| Priority | P1 |
| Type | Functional |
| Preconditions | PUB-01 has a code block and an image; NO-ALT fixture is on a test branch |
| Test data | PUB-01, NO-ALT |

**Steps**

1. Open PUB-01 and inspect the code block highlighting.
2. Click "Copy" and paste into a plain-text editor.
3. Resize the viewport and inspect the image.
4. Build the NO-ALT branch.
5. Build a fixture with `alt=""` on a decorative image.

**Expected result**

- Code is syntax-highlighted and readable in both themes.
- Copy places the exact code on the clipboard and shows a confirmation.
- The image scales with its container and preserves aspect ratio.
- NO-ALT fails the build with the file and image reference.
- The decorative `alt=""` fixture builds successfully.

**Actual result:** —

**Status:** Not run

---

### TC-022 — Theme follows the system, persists, and avoids flashing

| Field | Value |
| --- | --- |
| Requirement | REQ-F-13 |
| Priority | P1 |
| Type | Functional |
| Preconditions | Fresh browser profile; OS theme can be changed |
| Test data | Any page |

**Steps**

1. Set the OS to dark, clear storage, and hard-reload the home page.
2. Observe the first paint and the toggle state.
3. Toggle to light and reload.
4. Clear storage and set the OS to light, then reload.
5. Change the OS theme while the page is open.

**Expected result**

- The first paint matches the resolved theme, with no visible flash.
- The toggle reflects the current theme.
- An explicit choice persists across reloads.
- With no stored choice, the site follows the OS preference.
- Text and controls keep AA contrast in both themes.

**Actual result:** —

**Status:** Not run

---

### TC-023 — Table of contents links and active state work

| Field | Value |
| --- | --- |
| Requirement | REQ-F-14 |
| Priority | P2 |
| Type | Functional |
| Preconditions | PUB-01 has at least two H2/H3 headings and duplicate "Setup" headings |
| Test data | PUB-01 |

**Steps**

1. Open PUB-01 and inspect the TOC.
2. Compare entries with the rendered headings.
3. Click a TOC link and inspect the URL hash and scroll position.
4. Scroll through the post and observe the active highlight.
5. Open the URL with the hash directly.

**Expected result**

- The TOC lists all qualifying H2/H3 headings in document order.
- Duplicate headings receive unique anchors.
- Clicking an entry scrolls to the heading below the sticky header.
- The active entry updates while scrolling.
- A deep link with the hash loads at the correct section.

**Actual result:** —

**Status:** Not run

---

### TC-024 — Related posts are relevant and capped at three

| Field | Value |
| --- | --- |
| Requirement | REQ-F-15 |
| Priority | P2 |
| Type | Functional |
| Preconditions | One post shares tags with at least four others; another shares none |
| Test data | PUB-01…PUB-12, DRAFT-01 |

**Steps**

1. Open the post that shares four tags.
2. Count and inspect the related posts.
3. Open the post with no shared tags.
4. Inspect all related links.

**Expected result**

- At most three related posts are shown.
- Posts with more shared tags rank higher.
- The current post and drafts never appear.
- The no-shared-tag post falls back to recent published posts.
- Every related link returns HTTP 200.

**Actual result:** —

**Status:** Not run

---

### TC-025 — Pagination splits the feed correctly

| Field | Value |
| --- | --- |
| Requirement | REQ-F-16 |
| Priority | P1 |
| Type | Functional |
| Preconditions | Exactly 12 published posts exist |
| Test data | PUB-01…PUB-12 |

**Steps**

1. Open `/` and count the cards.
2. Open `/page/2` and count the cards.
3. Open `/page/3`.
4. Inspect the canonical URL on pages 1 and 2.
5. Inspect the pagination controls.

**Expected result**

- Page 1 shows 10 posts; page 2 shows the remaining 2.
- `/page/3` returns HTTP 404.
- Page 1 canonical is `/`; page 2 canonical is `/page/2`.
- Controls show the current page and total pages.
- No post appears on two pages.

**Actual result:** —

**Status:** Not run

---

### TC-026 — Invalid page numbers return 404

| Field | Value |
| --- | --- |
| Requirement | REQ-F-16 |
| Priority | P2 |
| Type | Negative |
| Preconditions | Production preview is running |
| Test data | `/page/0`, `/page/abc`, `/page/999` |

**Steps**

1. Request each URL.
2. Inspect status, body, and redirect behavior.

**Expected result**

- Each URL returns HTTP 404.
- The custom 404 page is shown.
- No redirect loop or server error occurs.

**Actual result:** —

**Status:** Not run

---

### TC-027 — Custom 404 page is helpful

| Field | Value |
| --- | --- |
| Requirement | REQ-F-17 |
| Priority | P1 |
| Type | Functional |
| Preconditions | Production preview is running |
| Test data | `/random-missing-page` |

**Steps**

1. Request `/random-missing-page`.
2. Inspect the status code and body.
3. Click Home, Archive, and Search.

**Expected result**

- The response status is 404.
- The page shows a short explanation.
- All three links work.
- No stack trace, internal path, or framework debug output is exposed.

**Actual result:** —

**Status:** Not run

---

### TC-028 — Share actions copy the canonical URL without third parties

| Field | Value |
| --- | --- |
| Requirement | REQ-F-18 |
| Priority | P2 |
| Type | Functional |
| Preconditions | Production preview is running; test on desktop and mobile |
| Test data | PUB-01 |

**Steps**

1. On desktop, click "Copy link" and paste into a text editor.
2. Confirm the confirmation message.
3. On mobile with Web Share support, use the share button.
4. Emulate a browser without Web Share.
5. Monitor the network panel while using both actions.

**Expected result**

- The canonical post URL is copied exactly.
- A visible success confirmation appears.
- The native share sheet opens when supported.
- Without Web Share, the action falls back to copy.
- No third-party share or tracking requests are made.

**Actual result:** —

**Status:** Not run

---

### TC-029 — Broken internal links fail CI

| Field | Value |
| --- | --- |
| Requirement | REQ-F-19 |
| Priority | P0 |
| Type | Negative |
| Preconditions | INVALID-LINK fixture is on a test branch |
| Test data | INVALID-LINK |

**Steps**

1. Push the branch or run the CI validation command.
2. Inspect the build log.
3. Check the deployment status.

**Expected result**

- The CI job fails.
- The error names the source file and the missing target `/posts/does-not-exist`.
- No deployment is created from the failed build.

**Actual result:** —

**Status:** Not run

---

### TC-030 — Duplicate slugs fail CI

| Field | Value |
| --- | --- |
| Requirement | REQ-F-19 |
| Priority | P1 |
| Type | Negative |
| Preconditions | DUP-SLUG fixture is on a test branch |
| Test data | DUP-SLUG |

**Steps**

1. Build the branch.
2. Inspect the error output and deployment status.

**Expected result**

- The build fails with a duplicate-slug error.
- Both conflicting file paths are named.
- No deployment is created.

**Actual result:** —

**Status:** Not run

---

### TC-031 — Contact link opens a prefilled email

| Field | Value |
| --- | --- |
| Requirement | REQ-F-20 |
| Priority | P2 |
| Type | Functional |
| Preconditions | About content includes a contact email |
| Test data | About content fixture |

**Steps**

1. Open `/about`.
2. Inspect the contact link `href`.
3. Click the link.

**Expected result**

- The link uses `mailto:` with the configured address.
- A subject is prefilled.
- The default email client opens.
- No form or network request to a backend is made.

**Actual result:** —

**Status:** Not run

## 4. Non-functional test cases

### TC-032 — Lighthouse and bundle budgets pass

| Field | Value |
| --- | --- |
| Requirement | REQ-NF-01 |
| Priority | P0 |
| Type | Non-functional |
| Preconditions | Production build; Lighthouse mobile preset |
| Test data | `/`, `/posts/hello-world`, `/tags/typescript` |

**Steps**

1. Run Lighthouse in mobile mode three times on each page.
2. Record the median Performance, Accessibility, SEO, and Best Practices scores.
3. Measure initial JavaScript transferred, gzip-compressed.
4. Inspect the network waterfall for render-blocking third-party scripts.

**Expected result**

- Every category scores 95 or higher.
- Initial JavaScript is 150 KB gzip or less.
- No third-party script blocks first render.
- No layout-shifting late-loaded assets appear.

**Actual result:** —

**Status:** Not run

---

### TC-033 — Core Web Vitals meet the targets

| Field | Value |
| --- | --- |
| Requirement | REQ-NF-01 |
| Priority | P0 |
| Type | Non-functional |
| Preconditions | Throttled 4G profile on a mid-range mobile device or emulation |
| Test data | `/`, `/posts/hello-world` |

**Steps**

1. Run three throttled lab tests or collect field data at p75.
2. Record LCP, CLS, and INP.
3. Repeat on the post page.

**Expected result**

- LCP is 2.0 seconds or less.
- CLS is below 0.1.
- INP is below 200 ms.
- Results are consistent across the three runs.

**Actual result:** —

**Status:** Not run

---

### TC-034 — Keyboard navigation and automated accessibility pass

| Field | Value |
| --- | --- |
| Requirement | REQ-NF-02 |
| Priority | P0 |
| Type | Non-functional |
| Preconditions | Production preview is running |
| Test data | Home, post, tag, search, and 404 pages |

**Steps**

1. Navigate each page using only Tab, Shift+Tab, Enter, Space, arrow keys, and Escape.
2. Check the skip link and focus visibility.
3. Run axe DevTools on each page.
4. Check for keyboard traps.

**Expected result**

- Every interactive element is reachable in a logical order.
- Focus is always visible.
- The skip link moves focus to the main content.
- No keyboard trap exists.
- axe reports zero critical and zero serious issues.

**Actual result:** —

**Status:** Not run

---

### TC-035 — Screen reader semantics and motion preferences work

| Field | Value |
| --- | --- |
| Requirement | REQ-NF-02 |
| Priority | P1 |
| Type | Non-functional |
| Preconditions | NVDA on Windows and VoiceOver on iOS available |
| Test data | Home, post, search |

**Steps**

1. Navigate each page with the screen reader.
2. Check landmarks, heading order, and the page H1.
3. Check image alt text and the search input label.
4. Enable the OS reduced-motion setting and reload.

**Expected result**

- Each page exposes one main landmark, navigation, and footer.
- There is exactly one visible H1 per page and heading levels do not skip.
- Images have meaningful alt text; decorative images are ignored.
- The search input has an accessible name.
- Animations are reduced or removed when requested.

**Actual result:** —

**Status:** Not run

---

### TC-036 — Core content works without JavaScript

| Field | Value |
| --- | --- |
| Requirement | REQ-NF-03 |
| Priority | P1 |
| Type | Non-functional |
| Preconditions | Production build is running |
| Test data | Home, post, About |

**Steps**

1. Disable JavaScript in the browser.
2. Load each page and navigate between them.
3. Fetch the post HTML with `curl` and inspect the head and body.
4. Crawl internal links.

**Expected result**

- Content and navigation are readable without JavaScript.
- Title, description, canonical, Open Graph, and JSON-LD are present in the initial HTML.
- Internal links work without client-side routing.
- No page renders as a blank shell.

**Actual result:** —

**Status:** Not run

---

### TC-037 — Security headers, secrets, and dependencies are clean

| Field | Value |
| --- | --- |
| Requirement | REQ-NF-04 |
| Priority | P0 |
| Type | Non-functional |
| Preconditions | Deployed site and production bundle available |
| Test data | Deployed URL, build output |

**Steps**

1. Inspect response headers over HTTPS.
2. Search the client bundle for API keys, tokens, and private paths.
3. Run the production dependency audit.
4. Inspect all external links.
5. Check the browser console for CSP violations.

**Expected result**

- HTTPS with HSTS is enforced.
- Content-Security-Policy, `X-Content-Type-Options: nosniff`, and a restrictive `Referrer-Policy` are present.
- No secrets appear in client assets.
- The audit reports no high or critical advisories.
- External links use `rel="noopener noreferrer"`.
- No CSP violations appear in the console.

**Actual result:** —

**Status:** Not run

---

### TC-038 — Default experience sets no tracking cookies

| Field | Value |
| --- | --- |
| Requirement | REQ-NF-05 |
| Priority | P0 |
| Type | Non-functional |
| Preconditions | Fresh browser profile with cleared storage |
| Test data | Home, post, search |

**Steps**

1. Open DevTools and clear cookies, local storage, and cache.
2. Load each page and navigate between them.
3. Inspect cookies, local storage, and session storage.
4. Inspect all network requests by domain.
5. Toggle the theme and repeat the storage check.

**Expected result**

- No cookies are set.
- No tracking identifiers are stored.
- The only persisted key is the functional theme preference.
- No third-party request occurs before a deliberate user action.
- No analytics or advertising script is loaded.

**Actual result:** —

**Status:** Not run

---

### TC-039 — Supported browsers and small screens behave consistently

| Field | Value |
| --- | --- |
| Requirement | REQ-NF-06 |
| Priority | P1 |
| Type | Non-functional |
| Preconditions | Test devices or emulators available |
| Test data | Home, post, search, 404 |

**Steps**

1. Open the site in the latest two versions of Chrome, Firefox, Safari, and Edge.
2. Test iOS Safari 16+ and Android Chrome 120+.
3. Test at 320 px width.
4. Exercise navigation, theme toggle, search, copy-code, and share.

**Expected result**

- Layout and typography are consistent across browsers.
- No horizontal overflow at 320 px.
- Navigation, theme, search, copy, and share work or degrade gracefully.
- No browser-specific blocking error appears.

**Actual result:** —

**Status:** Not run

---

### TC-040 — Deployment is fast, safe, and reversible

| Field | Value |
| --- | --- |
| Requirement | REQ-NF-07 |
| Priority | P1 |
| Type | Non-functional |
| Preconditions | CI/CD configured for `main` |
| Test data | A harmless content change; a deliberately broken build |

**Steps**

1. Push a harmless change to `main` and time the deploy.
2. Run a smoke test on the live URL.
3. Push a deliberately broken build and confirm it does not deploy.
4. Roll back to the previous deployment and time it.
5. Check HTTPS and availability reporting.

**Expected result**

- A successful deploy completes in 5 minutes or less.
- The smoke test passes on the live site.
- The broken build never reaches production.
- Rollback completes in 5 minutes or less.
- HTTPS is enforced and the monthly availability target is measurable.

**Actual result:** —

**Status:** Not run

---

### TC-041 — A fresh clone can build and publish without code changes

| Field | Value |
| --- | --- |
| Requirement | REQ-NF-08 |
| Priority | P1 |
| Type | Non-functional |
| Preconditions | README is complete; clean machine or container |
| Test data | Repository, one new post |

**Steps**

1. Clone the repository into a clean directory.
2. Follow the README from the first command to a running preview and time it.
3. Run the single documented check command.
4. Add a new post using only the documented content workflow.
5. Rebuild and open the new post.

**Expected result**

- A new contributor reaches a running site in 15 minutes or less.
- The documented command runs lint, typecheck, tests, and build successfully.
- The new post appears with no code changes.
- Content and presentation remain in separate directories.

**Actual result:** —

**Status:** Not run

## 5. Exit criteria

- [ ] All P0 and P1 cases executed.
- [ ] No open Critical or High severity defect.
- [ ] Every `Must` requirement has at least one passing test case.
- [ ] Every test case links to an existing requirement.
- [ ] Traceability matrix is complete and has no orphan requirement.
- [ ] Production smoke test passes on the deployed URL.

## 6. Defect log

| Defect | Test case | Severity | Description | Status |
| --- | --- | --- | --- | --- |
| — | — | — | No defects logged yet | — |

## 7. Sign-off

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Blog owner | Product owner | Pending | — |
| OpenCode | Test author | Draft prepared | 2026-10-22 |
