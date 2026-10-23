import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { parse } from 'yaml';

const root = process.cwd();
const postsDir = join(root, 'src', 'content', 'posts');
const publicDir = join(root, 'public');
const errors = [];
const warnings = [];

const normalizeTag = (tag) =>
  tag
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

const walk = (directory) => {
  const files = [];

  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      files.push(...walk(path));
    } else if (['.md', '.mdx'].includes(extname(entry))) {
      files.push(path);
    }
  }

  return files;
};

const report = (file, message) => {
  errors.push(`${relative(root, file)}: ${message}`);
};

const files = walk(postsDir);
const posts = [];
const slugs = new Map();

for (const file of files) {
  const source = readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!frontmatter) {
    report(file, 'missing YAML frontmatter block');
    continue;
  }

  let data;

  try {
    data = parse(frontmatter[1]) ?? {};
  } catch (error) {
    report(file, `invalid YAML: ${error.message}`);
    continue;
  }

  if (typeof data.title !== 'string' || data.title.length < 1 || data.title.length > 120) {
    report(file, '"title" must be a string of 1–120 characters');
  }

  const date = data.date instanceof Date ? data.date : new Date(String(data.date ?? ''));

  if (Number.isNaN(date.valueOf())) {
    report(file, '"date" must be a valid ISO date, for example 2026-01-31');
  }

  if (typeof data.summary !== 'string' || data.summary.length < 1 || data.summary.length > 200) {
    report(file, '"summary" must be a string of 1–200 characters');
  }

  if (!Array.isArray(data.tags)) {
    report(file, '"tags" must be an array (use [] when there are no tags)');
  } else {
    if (data.tags.length > 5) {
      report(file, `"tags" has ${data.tags.length} entries; the maximum is 5`);
    }

    for (const tag of data.tags) {
      if (typeof tag !== 'string' || normalizeTag(tag).length === 0) {
        report(file, `tag ${JSON.stringify(tag)} is empty after normalization`);
      }
    }
  }

  if (data.draft !== undefined && typeof data.draft !== 'boolean') {
    report(file, '"draft" must be true or false');
  }

  if (data.cover !== undefined) {
    if (typeof data.cover !== 'string' || data.cover.length === 0) {
      report(file, '"cover" must be a local image path');
    } else {
      const coverPath = data.cover.startsWith('/')
        ? join(publicDir, data.cover.slice(1))
        : resolve(dirname(file), data.cover);

      if (!existsSync(coverPath)) {
        report(file, `cover image not found: ${data.cover}`);
      }

      if (typeof data.coverAlt !== 'string' || data.coverAlt.trim().length === 0) {
        report(file, '"coverAlt" is required when "cover" is set');
      }
    }
  }

  if (data.cardImage !== undefined) {
    if (typeof data.cardImage !== 'string' || data.cardImage.length === 0) {
      report(file, '"cardImage" must be a local image path');
    } else {
      const cardImagePath = data.cardImage.startsWith('/')
        ? join(publicDir, data.cardImage.slice(1))
        : resolve(dirname(file), data.cardImage);

      if (!existsSync(cardImagePath)) {
        report(file, `card image not found: ${data.cardImage}`);
      }

      if (typeof data.cardImageAlt !== 'string' || data.cardImageAlt.trim().length === 0) {
        report(file, '"cardImageAlt" is required when "cardImage" is set');
      }
    }
  }

  const slug = typeof data.slug === 'string' && data.slug.length > 0
    ? data.slug
    : basename(file, extname(file));

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    report(file, `slug "${slug}" must use lowercase letters, numbers, and single hyphens`);
  }

  if (slugs.has(slug)) {
    report(file, `duplicate slug "${slug}" also used by ${relative(root, slugs.get(slug))}`);
  } else {
    slugs.set(slug, file);
  }

  posts.push({
    file,
    slug,
    body: source.slice(frontmatter[0].length),
    tags: Array.isArray(data.tags) ? data.tags.map(normalizeTag).filter(Boolean) : [],
    draft: data.draft === true,
    date,
  });
}

const published = posts.filter((post) => !post.draft);
const knownTags = new Set(published.flatMap((post) => post.tags));
const knownSlugs = new Set(published.map((post) => post.slug));
const totalPages = Math.ceil(published.length / 10);
const knownPages = new Set(['/', '/about/', '/archive/', '/tags/', '/search/', '/rss.xml', '/sitemap.xml', '/robots.txt', '/404/']);

for (let page = 2; page <= totalPages; page += 1) {
  knownPages.add(`/page/${page}/`);
}

const looksLikeFile = (path) => {
  if (!path.startsWith('/')) return false;
  return existsSync(join(publicDir, path.slice(1)));
};

const checkLocalAsset = (file, source, label) => {
  if (!source || /^(?:[a-z]+:|#|\/\/)/i.test(source)) return;
  const clean = source.split(/[?#]/)[0];

  if (!clean) return;

  const target = clean.startsWith('/') ? join(publicDir, clean.slice(1)) : resolve(dirname(file), clean);

  if (!existsSync(target)) {
    report(file, `${label} not found: ${source}`);
  }
};

for (const post of posts) {
  const body = post.body;

  for (const match of body.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)) {
    const target = match[1];

    if (/^(?:https?:|mailto:|tel:|#|\/\/|data:)/i.test(target)) continue;

    const path = target.split(/[?#]/)[0];
    if (!path) continue;

    if (path.startsWith('/posts/')) {
      const slug = path.replace(/^\/posts\//, '').replace(/\/$/, '');
      if (!knownSlugs.has(slug)) {
        report(post.file, `link points to missing post: ${target}`);
      }
      continue;
    }

    if (path.startsWith('/tags/')) {
      const tag = path.replace(/^\/tags\//, '').replace(/\/$/, '');
      if (!knownTags.has(tag)) {
        report(post.file, `link points to missing tag: ${target}`);
      }
      continue;
    }

    if (knownPages.has(path)) continue;
    if (looksLikeFile(path)) continue;

    report(post.file, `link points to an unknown internal path: ${target}`);
  }

  for (const match of body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)) {
    if (match[1].trim().length === 0) {
      report(post.file, 'Markdown image is missing alt text');
    }
    checkLocalAsset(post.file, match[2], 'image');
  }

  for (const match of body.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const alt = tag.match(/\balt\s*=\s*["']([^"']*)["']/i);
    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);

    if (!alt) {
      report(post.file, 'HTML image is missing an alt attribute (use alt="" for decorative images)');
    }

    if (src) {
      checkLocalAsset(post.file, src[1], 'image');
    }
  }
}

if (files.length === 0) {
  warnings.push('No posts found in src/content/posts.');
}

console.log(`Validated ${files.length} post${files.length === 1 ? '' : 's'} (${published.length} published).`);

if (warnings.length > 0) {
  for (const warning of warnings) console.warn(`⚠ ${warning}`);
}

if (errors.length > 0) {
  console.error(`\n✖ ${errors.length} content problem${errors.length === 1 ? '' : 's'}:`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('✓ Content validation passed.');
