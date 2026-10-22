import { test, expect } from '@playwright/test';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const POSTS = {
  welcome: 'welcome-to-blog-web',
  fast: 'building-a-fast-static-blog',
  typescript: 'typescript-patterns-i-use',
  dark: 'dark-mode-without-the-flash',
  toc: 'toc-that-earns-its-place',
  plain: 'why-plain-text-wins',
  css: 'small-css-wins',
  network: 'reading-the-network-tab',
  ci: 'one-command-for-ci',
  commits: 'writing-better-commit-messages',
  focus: 'accessible-focus-states',
  search: 'a-smaller-search-index',
  draft: 'the-next-post',
};

const postUrl = (slug: string) => `/posts/${slug}/`;

function runValidate() {
  try {
    const stdout = execFileSync(process.execPath, ['scripts/validate-content.mjs'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    return { code: 0, output: stdout };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string };
    return {
      code: failure.status ?? 1,
      output: `${failure.stdout ?? ''}${failure.stderr ?? ''}`,
    };
  }
}

function makeFixtureDir(label: string) {
  const directory = join(process.cwd(), 'src', 'content', 'posts', `zz-pw-${label}`);
  mkdirSync(directory, { recursive: true });
  return directory;
}

function writeFixture(directory: string, path: string, content: string) {
  const file = join(directory, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf8');
  return file;
}

function listFiles(directory: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      files.push(...listFiles(path));
    } else {
      files.push(path);
    }
  }

  return files;
}

async function waitForServer(url: string, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
}

test.afterEach(async ({ page }, testInfo) => {
  const id = testInfo.title.match(/TC-\d{3}/)?.[0] ?? 'test';

  try {
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach(`${id}-full-page.png`, {
      body: screenshot,
      contentType: 'image/png',
    });

    await testInfo.attach(`${id}-context.json`, {
      body: JSON.stringify(
        {
          test: testInfo.title,
          url: page.url(),
          title: await page.title().catch(() => ''),
          status: testInfo.status,
        },
        null,
        2,
      ),
      contentType: 'application/json',
    });
  } catch {
    // Request-only or closed-page tests may not have a capturable page.
  }
});

test('TC-001 — Home feed shows the ten newest published posts', async ({ page }) => {
  await page.goto('/');

  const cards = page.locator('.post-card');
  await expect(cards).toHaveCount(10);
  await expect(cards.first().locator('.post-card-title')).toContainText('Welcome to Blog Web');
  await expect(cards.nth(9).locator('.post-card-title')).toContainText('Writing better commit messages');

  const dates = await cards.locator('time').evaluateAll((nodes) =>
    nodes.map((node) => new Date(node.getAttribute('datetime') ?? '').valueOf()),
  );
  expect(dates).toEqual([...dates].sort((a, b) => b - a));
  await expect(page.getByText('DRAFT-SENTINEL-7Q2')).toHaveCount(0);
  await expect(page.locator('.pagination a[rel="next"]')).toHaveAttribute('href', '/page/2/');
});

test('TC-002 — Home feed shows an empty state when nothing is published', async ({ page }) => {
  test.setTimeout(180_000);

  const postsDir = join(process.cwd(), 'src', 'content', 'posts');
  const backupDir = join(process.cwd(), 'src', 'content', 'posts.__empty_backup');

  try {
    if (existsSync(backupDir)) rmSync(backupDir, { recursive: true, force: true });
    mkdirSync(backupDir, { recursive: true });
    for (const entry of readdirSync(postsDir)) {
      renameSync(join(postsDir, entry), join(backupDir, entry));
    }

    try {
      execFileSync(process.env.ComSpec ?? 'cmd.exe', ['/c', 'npm run build'], {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      const failure = error as { stdout?: string; stderr?: string };
      throw new Error(`Empty build failed:\n${failure.stdout ?? ''}\n${failure.stderr ?? ''}`);
    }

    const html = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf8');
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.empty-state')).toContainText('No posts are published yet');
    await expect(page.getByRole('link', { name: 'About page' })).toHaveAttribute('href', '/about/');
    await expect(page.locator('.post-card')).toHaveCount(0);
    await expect(page.locator('.empty-state')).toBeVisible();
  } finally {
    if (existsSync(backupDir)) {
      for (const entry of readdirSync(backupDir)) {
        renameSync(join(backupDir, entry), join(postsDir, entry));
      }
      rmSync(backupDir, { recursive: true, force: true });
    }

    execFileSync(process.env.ComSpec ?? 'cmd.exe', ['/c', 'npm run build'], {
      cwd: process.cwd(),
      stdio: 'ignore',
    });
  }
});

test('TC-003 — Post page renders content and metadata', async ({ page }) => {
  await page.goto(postUrl(POSTS.welcome));

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to Blog Web');
  await expect(page.locator('.post-cover img')).toHaveAttribute('alt', /Dark gradient banner/);
  await expect(page.locator('.post-meta')).toContainText('min read');
  await expect(page.locator('.post-meta .tag')).toHaveCount(2);
  await expect(page.locator('.prose h2')).toHaveCount(4);
  await expect(page.locator('.prose pre code')).toBeVisible();
  await expect(page.locator('.prose')).not.toContainText('date: 2026-09-28');
});

test('TC-004 — Unknown and draft-only slugs return 404', async ({ page, request }) => {
  expect((await request.get(postUrl('does-not-exist'))).status()).toBe(404);
  expect((await request.get(postUrl(POSTS.draft))).status()).toBe(404);

  await page.goto(postUrl(POSTS.draft));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('That page is not here.');
  await expect(page.locator('body')).not.toContainText('DRAFT-SENTINEL-7Q2');
});

test('TC-005 — Valid frontmatter is accepted and rendered', async ({ page }) => {
  await page.goto(postUrl(POSTS.welcome));

  await expect(page.locator('time').first()).toHaveAttribute('datetime', '2026-09-28T00:00:00.000Z');
  await expect(page.locator('.post-header h1')).toHaveText('Welcome to Blog Web');
  await expect(page.locator('.post-lede')).toHaveText(
    'Why this site exists, what I plan to write about, and how the blog is built.',
  );
  await expect(page.locator('.post-cover img')).toHaveAttribute('alt', /Dark gradient banner/);
  await expect(page.locator('.tag')).toHaveCount(2);
});

test('TC-006 — Invalid frontmatter fails validation with an actionable error', async () => {
  const directory = makeFixtureDir('invalid-frontmatter');

  try {
    writeFixture(
      directory,
      'missing-title.mdx',
      `---\ndate: 2026-01-01\nsummary: "Missing title fixture."\ntags: []\n---\n\nBody.\n`,
    );

    const result = runValidate();
    expect(result.code).not.toBe(0);
    expect(result.output).toContain('missing-title.mdx');
    expect(result.output).toContain('"title"');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('TC-007 — Drafts are excluded from production surfaces', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByText('DRAFT-SENTINEL-7Q2')).toHaveCount(0);

  expect((await request.get(postUrl(POSTS.draft))).status()).toBe(404);
  expect((await request.get('/tags/secret-tag/')).status()).toBe(404);

  const rss = await (await request.get('/rss.xml')).text();
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const index = await (await request.get('/search-index.json')).text();
  expect(rss).not.toContain('DRAFT-SENTINEL-7Q2');
  expect(sitemap).not.toContain(POSTS.draft);
  expect(index).not.toContain('DRAFT-SENTINEL-7Q2');
});

test('TC-008 — Drafts are previewable in development with a badge', async ({ page }) => {
  test.setTimeout(120_000);

  const child = spawn(
    process.env.ComSpec ?? 'cmd.exe',
    ['/c', 'npm run dev -- --host 127.0.0.1 --port 4322'],
    {
      cwd: process.cwd(),
      stdio: 'ignore',
      windowsHide: true,
    },
  );

  try {
    expect(await waitForServer('http://127.0.0.1:4322/')).toBeTruthy();
    await page.goto('http://127.0.0.1:4322/posts/the-next-post/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The next post');
    await expect(page.locator('.draft-badge')).toBeVisible();
    await expect(page.locator('.prose')).toContainText('This is a draft post');
  } finally {
    if (child.pid) {
      try {
        execFileSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      } catch {
        // The process may already have exited.
      }
    }
  }
});

test('TC-009 — Tag index lists normalized tags and counts', async ({ page }) => {
  await page.goto('/tags/');

  const links = page.locator('.tag-cloud a');
  await expect(links).toHaveCount(9);
  await expect(page.locator('.tag-cloud')).toContainText('typescript');
  await expect(page.locator('.tag-cloud')).toContainText('web-dev');
  await expect(page.locator('.tag-cloud')).not.toContainText('secret-tag');

  const names = await links.evaluateAll((nodes) =>
    nodes.map((node) => (node.textContent ?? '').trim().split(/\s+/)[0]),
  );
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
});

test('TC-010 — Tag page filters correctly and unknown tags return 404', async ({ page, request }) => {
  await page.goto('/tags/typescript/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('typescript');
  await expect(page.locator('.post-card')).toHaveCount(1);
  await expect(page.locator('.post-card-title')).toContainText('TypeScript patterns I reach for');

  expect((await request.get('/tags/does-not-exist/')).status()).toBe(404);
  await page.goto('/tags/does-not-exist/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('That page is not here.');
});

test('TC-011 — Tag normalization and the five-tag limit are enforced', async () => {
  const directory = makeFixtureDir('tag-limit');

  try {
    writeFixture(
      directory,
      'too-many-tags.mdx',
      `---\ntitle: "Too many tags"\ndate: 2026-01-02\nsummary: "Six tags should fail."\ntags: [one, two, three, four, five, six]\n---\n\nBody.\n`,
    );

    const result = runValidate();
    expect(result.code).not.toBe(0);
    expect(result.output).toContain('maximum is 5');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('TC-012 — Search matches title, body, and tags case-insensitively', async ({ page }) => {
  await page.goto('/search/');
  await expect(page.locator('.search-result')).toHaveCount(6);

  const input = page.getByLabel('Search posts');
  await input.fill('typescript');
  await expect(page.locator('.search-result')).toHaveCount(2);
  const lowercaseTitles = await page.locator('.search-result h2').allTextContents();
  await expect(page.locator('[data-search-status]')).toContainText('2 results');

  await input.fill('TYPE');
  await expect(page.locator('[data-search-status]')).toContainText('results');
  const uppercaseTitles = await page.locator('.search-result h2').allTextContents();
  expect(lowercaseTitles.every((title) => uppercaseTitles.includes(title))).toBeTruthy();

  await input.fill('performance');
  await expect(page.locator('[data-search-status]')).toContainText('results');
  await expect(page.locator('.search-result')).not.toHaveCount(0);
});

test('TC-013 — Search handles empty, no-result, and keyboard states', async ({ page }) => {
  await page.goto('/search/');
  const input = page.getByLabel('Search posts');

  await input.fill('zzzzzz');
  await expect(page.locator('.search-empty')).toContainText('No posts match');
  await expect(page.locator('[data-search-suggestions]')).toBeVisible();

  await input.press('Escape');
  await expect(input).toHaveValue('');
  await expect(page.locator('.search-result')).toHaveCount(6);

  await input.press('ArrowDown');
  await expect(page.locator('.search-result.is-active')).toHaveCount(1);
});

test('TC-014 — Archive groups every published post by year', async ({ page }) => {
  await page.goto('/archive/');

  await expect(page.locator('.archive-year')).toHaveText('2026');
  await expect(page.locator('.archive-list li')).toHaveCount(12);
  await expect(page.locator('.archive-list a')).toHaveCount(12);
  await expect(page.locator('.archive')).not.toContainText('The next post');
});

test('TC-015 — About page renders owner content without code changes', async ({ page }) => {
  await page.goto('/about/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
  await expect(page.locator('.about-avatar')).toHaveAttribute('alt', /Illustrated portrait/);
  await expect(page.getByRole('link', { name: 'Send an email' })).toHaveAttribute(
    'href',
    /mailto:hello@example\.com\?subject=/,
  );
  await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
});

test('TC-016 — RSS feed is valid and complete', async ({ page, request }) => {
  const response = await request.get('/rss.xml');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('xml');

  const body = await response.text();
  expect((body.match(/<item>/g) ?? []).length).toBe(12);
  expect(body).toContain('https://blog-web.example.com/posts/welcome-to-blog-web/');
  expect(body).not.toContain('DRAFT-SENTINEL-7Q2');

  await page.goto('/');
  await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
    'href',
    'https://blog-web.example.com/rss.xml',
  );
});

test('TC-017 — Sitemap and robots.txt expose only public URLs', async ({ page, request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<urlset');
  expect(sitemap).toContain('https://blog-web.example.com/posts/welcome-to-blog-web/');
  expect(sitemap).toContain('https://blog-web.example.com/tags/typescript/');
  expect(sitemap).not.toContain(POSTS.draft);

  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('User-agent: *');
  expect(robots).toContain('Sitemap: https://blog-web.example.com/sitemap.xml');

  await page.goto('/');
  await expect(page.locator('link[rel="sitemap"]')).toHaveAttribute(
    'href',
    'https://blog-web.example.com/sitemap.xml',
  );
});

test('TC-018 — Metadata is unique and complete on every page', async ({ page, request }) => {
  await page.goto(postUrl(POSTS.welcome));

  await expect(page).toHaveTitle('Welcome to Blog Web');
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description?.length ?? 0).toBeLessThanOrEqual(160);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://blog-web.example.com/posts/welcome-to-blog-web/',
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Welcome to Blog Web',
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );

  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toBeTruthy();
  expect(new URL(image ?? '').origin).toBe('https://blog-web.example.com');
  expect((await request.get(new URL(image ?? '').pathname)).status()).toBe(200);
});

test('TC-019 — BlogPosting structured data is valid', async ({ page }) => {
  await page.goto(postUrl(POSTS.welcome));

  const text = await page.locator('script[type="application/ld+json"]').first().textContent();
  const data = JSON.parse(text ?? '{}') as Record<string, unknown>;

  expect(data['@type']).toBe('BlogPosting');
  expect(data.headline).toBe('Welcome to Blog Web');
  expect(data.datePublished).toBe('2026-09-28T00:00:00.000Z');
  expect((data.author as Record<string, unknown>).name).toBe('Blog Web');
  expect(Array.isArray(data.image)).toBeTruthy();
});

test('TC-020 — Layout is responsive from 320 px to 1920 px', async ({ page }) => {
  await page.goto(postUrl(POSTS.welcome));

  for (const width of [320, 375, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      contentWidth: document.querySelector('.post-content')?.getBoundingClientRect().width ?? 0,
      navVisible: Boolean(document.querySelector('.site-nav')),
    }));

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
    expect(metrics.navVisible).toBeTruthy();

    if (width >= 1024) {
      expect(metrics.contentWidth).toBeGreaterThan(540);
      expect(metrics.contentWidth).toBeLessThan(780);
    }
  }
});

test('TC-021 — Code blocks, images, and alt text meet the reading rules', async ({ page }) => {
  await page.goto(postUrl(POSTS.welcome));

  await expect(page.locator('.prose pre code')).toBeVisible();
  await expect(page.locator('.copy-code')).toBeVisible();
  await page.locator('.copy-code').click();
  await expect(page.locator('.copy-code')).toHaveText('Copied');

  const imageFits = await page.evaluate(() => {
    const image = document.querySelector('.post-cover img');
    const cover = document.querySelector('.post-cover');
    if (!image || !cover) return false;
    return image.getBoundingClientRect().width <= cover.getBoundingClientRect().width + 1;
  });
  expect(imageFits).toBeTruthy();

  const directory = makeFixtureDir('alt-text');

  try {
    writeFixture(
      directory,
      'missing-alt.mdx',
      `---\ntitle: "Missing alt"\ndate: 2026-01-03\nsummary: "Image without alt."\ntags: []\n---\n\n<img src="/avatar.svg">\n`,
    );

    const bad = runValidate();
    expect(bad.code).not.toBe(0);
    expect(bad.output).toContain('alt attribute');

    rmSync(join(directory, 'missing-alt.mdx'));
    writeFixture(
      directory,
      'decorative.mdx',
      `---\ntitle: "Decorative image"\ndate: 2026-01-04\nsummary: "Explicitly decorative image."\ntags: []\n---\n\n<img src="/avatar.svg" alt="">\n`,
    );

    expect(runValidate().code).toBe(0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('TC-022 — Theme follows the system, persists, and avoids flashing', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'light' });
});

test('TC-023 — Table of contents links and active state work', async ({ page }) => {
  await page.goto(postUrl(POSTS.welcome));

  const links = page.locator('.toc a');
  await expect(links).toHaveCount(4);
  await expect(links.first()).toContainText('Why another blog?');

  await page.getByRole('link', { name: 'How it is built', exact: true }).click();
  await expect(page).toHaveURL(/#how-it-is-built$/);
  await expect(page.locator('#how-it-is-built')).toBeInViewport();
  await expect(page.locator('.toc a.is-active')).toContainText('How it is built');
});

test('TC-024 — Related posts are relevant and capped at three', async ({ page, request }) => {
  await page.goto(postUrl(POSTS.welcome));

  const items = page.locator('.related-list li');
  const count = await items.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(3);
  await expect(page.locator('.related')).not.toContainText('Welcome to Blog Web');
  await expect(page.locator('.related')).not.toContainText('The next post');

  for (const href of await page.locator('.related-list a').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('href') ?? ''),
  )) {
    expect((await request.get(href)).status()).toBe(200);
  }
});

test('TC-025 — Pagination splits the feed correctly', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('.post-card')).toHaveCount(10);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://blog-web.example.com/',
  );

  await page.goto('/page/2/');
  await expect(page.locator('.post-card')).toHaveCount(2);
  await expect(page.locator('.post-card').first()).toContainText('Accessible focus states');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://blog-web.example.com/page/2/',
  );
  await expect(page.locator('.pagination-status')).toHaveText('Page 2 of 2');
  expect((await request.get('/page/3/')).status()).toBe(404);
});

test('TC-026 — Invalid page numbers return 404', async ({ page, request }) => {
  for (const path of ['/page/0/', '/page/abc/', '/page/999/']) {
    expect((await request.get(path)).status()).toBe(404);
  }

  await page.goto('/page/999/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('That page is not here.');
});

test('TC-027 — Custom 404 page is helpful', async ({ page, request }) => {
  const response = await request.get('/random-missing-page');
  expect(response.status()).toBe(404);

  await page.goto('/random-missing-page');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('That page is not here.');
  await expect(page.locator('.not-found-links a')).toHaveCount(3);
  await expect(page.locator('.not-found-links a[href="/"]')).toBeVisible();
  await expect(page.locator('.not-found-links a[href="/archive/"]')).toBeVisible();
  await expect(page.locator('.not-found-links a[href="/search/"]')).toBeVisible();
});

test('TC-028 — Share actions copy the canonical URL without third parties', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
  });
  await page.goto(postUrl(POSTS.welcome));

  await page.locator('[data-copy-link]').click();
  await expect(page.locator('.share-status')).toHaveText('Link copied.');

  await page.locator('[data-native-share]').click();
  await expect(page.locator('.share-status')).toHaveText('Link copied.');

  const external = requests.filter((url) => !url.startsWith('http://127.0.0.1:4321'));
  expect(external).toEqual([]);
});

test('TC-029 — Broken internal links fail validation', async () => {
  const directory = makeFixtureDir('broken-link');

  try {
    writeFixture(
      directory,
      'broken-link.mdx',
      `---\ntitle: "Broken link"\ndate: 2026-01-05\nsummary: "Points at a missing post."\ntags: []\n---\n\n[Missing post](/posts/does-not-exist/)\n`,
    );

    const result = runValidate();
    expect(result.code).not.toBe(0);
    expect(result.output).toContain('missing post');
    expect(result.output).toContain('/posts/does-not-exist/');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('TC-030 — Duplicate slugs fail validation', async () => {
  const directory = makeFixtureDir('duplicate-slug');

  try {
    const content = `---\ntitle: "Duplicate"\ndate: 2026-01-06\nsummary: "Same slug in two folders."\ntags: []\n---\n\nBody.\n`;
    writeFixture(directory, 'one/same.mdx', content);
    writeFixture(directory, 'two/same.mdx', content);

    const result = runValidate();
    expect(result.code).not.toBe(0);
    expect(result.output).toContain('duplicate slug');
    expect(result.output).toContain('same.mdx');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('TC-031 — Contact link opens a prefilled email', async ({ page }) => {
  await page.goto('/about/');

  const link = page.getByRole('link', { name: 'Send an email' });
  const href = await link.getAttribute('href');
  expect(href).toContain('mailto:hello@example.com');
  expect(href).toContain('subject=');
  await expect(link).toBeVisible();
});

test('TC-032 — Bundle budgets stay under the limits', async ({ page }) => {
  await page.goto(postUrl(POSTS.welcome));
  await page.waitForLoadState('networkidle');

  const metrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const size = (entry: PerformanceResourceTiming) => entry.transferSize || entry.encodedBodySize || 0;
    return {
      jsBytes: resources
        .filter((entry) => entry.name.endsWith('.js'))
        .reduce((total, entry) => total + size(entry), 0),
      totalBytes: resources.reduce((total, entry) => total + size(entry), 0),
    };
  });

  expect(metrics.jsBytes).toBeLessThanOrEqual(150 * 1024);
  expect(metrics.totalBytes).toBeLessThanOrEqual(500 * 1024);
});

test('TC-033 — Core Web Vitals meet the local targets', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __lcp: number; __cls: number; __events: number[] }).__lcp = 0;
    (window as unknown as { __lcp: number; __cls: number; __events: number[] }).__cls = 0;
    (window as unknown as { __lcp: number; __cls: number; __events: number[] }).__events = [];

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        (window as unknown as { __lcp: number }).__lcp = entry.startTime;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        const shift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
        if (!shift.hadRecentInput) {
          (window as unknown as { __cls: number }).__cls += shift.value ?? 0;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        (window as unknown as { __events: number[] }).__events.push(entry.duration);
      }
    }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as unknown as PerformanceObserverInit);
  });

  await page.goto(postUrl(POSTS.welcome));
  await page.waitForTimeout(800);
  await page.locator('[data-theme-toggle]').click();
  await page.waitForTimeout(200);

  const metrics = await page.evaluate(() => {
    const state = window as unknown as { __lcp: number; __cls: number; __events: number[] };
    return { lcp: state.__lcp, cls: state.__cls, maxEvent: Math.max(0, ...state.__events) };
  });

  expect(metrics.lcp).toBeGreaterThan(0);
  expect(metrics.lcp).toBeLessThan(2000);
  expect(metrics.cls).toBeLessThan(0.1);
  expect(metrics.maxEvent).toBeLessThan(200);
});

test('TC-034 — Keyboard navigation reaches interactive controls', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  const skipLink = await page.evaluate(() => document.activeElement?.textContent?.trim());
  expect(skipLink).toBe('Skip to content');

  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();

  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element) return null;
    const style = getComputedStyle(element);
    return {
      tag: element.tagName,
      outline: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });

  expect(focused?.tag).not.toBe('BODY');
  expect(focused?.outline).not.toBe('none');
});

test('TC-035 — Screen reader semantics and motion preferences work', async ({ page }) => {
  await page.goto('/');

  expect(await page.locator('header').count()).toBeGreaterThan(0);
  expect(await page.locator('nav').count()).toBeGreaterThan(0);
  expect(await page.locator('main').count()).toBe(1);
  expect(await page.locator('footer').count()).toBeGreaterThan(0);
  expect(await page.locator('h1').count()).toBe(1);
  expect(
    await page.locator('img').evaluateAll((images) => images.every((image) => image.hasAttribute('alt'))),
  ).toBeTruthy();

  await page.goto('/search/');
  await expect(page.getByLabel('Search posts')).toBeVisible();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const transition = await page.locator('.post-card').first().evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(transition).not.toBe('0.16s');
});

test('TC-036 — Core content works without JavaScript', async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  try {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog Web');
    await expect(page.locator('.post-card').first()).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();

    await page.goto(postUrl(POSTS.welcome));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to Blog Web');
    await expect(page.locator('.prose')).toContainText('This is the first post on Blog Web');

    const html = await (await request.get(postUrl(POSTS.welcome))).text();
    expect(html).toContain('<title>Welcome to Blog Web</title>');
    expect(html).toContain('application/ld+json');
  } finally {
    await context.close();
  }
});

test('TC-037 — Security rules and external link handling are configured', async ({ page }) => {
  const headers = readFileSync(join(process.cwd(), 'dist', '_headers'), 'utf8');
  expect(headers).toContain('Strict-Transport-Security');
  expect(headers).toContain('Content-Security-Policy');
  expect(headers).toContain('X-Content-Type-Options: nosniff');

  const vercel = readFileSync(join(process.cwd(), 'vercel.json'), 'utf8');
  expect(vercel).toContain('Strict-Transport-Security');
  expect(vercel).toContain('Content-Security-Policy');

  await page.goto('/about/');
  await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );

  const files = listFiles(join(process.cwd(), 'dist')).filter((file) => /\.(html|js)$/.test(file));
  for (const file of files) {
    expect(readFileSync(file, 'utf8')).not.toContain('PRIVATE KEY');
  }
});

test('TC-038 — Default experience sets no tracking cookies', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const hosts = new Set<string>();

  page.on('request', (request) => {
    try {
      hosts.add(new URL(request.url()).host);
    } catch {
      // Ignore non-HTTP requests such as data URLs.
    }
  });

  try {
    await page.goto('/');
    await page.goto(postUrl(POSTS.welcome));
    await page.goto('/search/');
    await expect(page.locator('.search-result')).not.toHaveCount(0);

    expect(await context.cookies()).toEqual([]);
    const externalHosts = [...hosts].filter((host) => host !== '127.0.0.1:4321');
    expect(externalHosts).toEqual([]);

    const storage = await page.evaluate(() => Object.keys(localStorage));
    expect(storage.filter((key) => key !== 'theme')).toEqual([]);
  } finally {
    await context.close();
  }
});

test('TC-039 — Supported viewports and interactive features work', async ({ page }) => {
  await page.goto('/');

  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBeFalsy();
  }

  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.goto('/search/');
  await expect(page.getByLabel('Search posts')).toBeVisible();
});

test('TC-040 — Production output is complete and deployable', async ({ request }) => {
  expect((await request.get('/')).status()).toBe(200);
  expect((await request.get('/404.html')).status()).toBe(200);
  expect((await request.get('/rss.xml')).status()).toBe(200);
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
  expect((await request.get('/robots.txt')).status()).toBe(200);

  expect(existsSync(join(process.cwd(), 'dist', 'index.html'))).toBeTruthy();
  expect(existsSync(join(process.cwd(), 'dist', '404.html'))).toBeTruthy();
  expect(existsSync(join(process.cwd(), 'dist', '_headers'))).toBeTruthy();
});

test('TC-041 — A fresh clone can validate and build without code changes', async () => {
  expect(existsSync(join(process.cwd(), 'README.md'))).toBeTruthy();
  expect(existsSync(join(process.cwd(), 'src', 'content', 'pages', 'about.mdx'))).toBeTruthy();

  const posts = listFiles(join(process.cwd(), 'src', 'content', 'posts')).filter((file) =>
    /\.(md|mdx)$/.test(file),
  );
  expect(posts.length).toBe(13);

  const result = runValidate();
  expect(result.code).toBe(0);
  expect(result.output).toContain('Content validation passed');

  const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
    scripts?: Record<string, string>;
  };
  expect(packageJson.scripts?.build).toBe('astro build');
  expect(packageJson.scripts?.validate).toContain('validate-content');
});
