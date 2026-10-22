import type { APIRoute } from 'astro';
import { SITE_URL } from '../consts';
import { getPublishedPosts, postUrl } from '../lib/posts';
import { getTagCounts, tagUrl } from '../lib/tags';

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(SITE_URL);
  const posts = await getPublishedPosts();
  const tags = [...getTagCounts(posts).keys()];
  const totalPages = Math.ceil(posts.length / 10);

  const paths = new Set<string>(['/', '/about/', '/archive/', '/tags/']);

  for (const post of posts) {
    paths.add(postUrl(post));
  }

  for (const tag of tags) {
    paths.add(tagUrl(tag));
  }

  for (let page = 2; page <= totalPages; page += 1) {
    paths.add(`/page/${page}/`);
  }

  const lastModified = new Map<string, string>();
  for (const post of posts) {
    lastModified.set(postUrl(post), post.data.updated?.toISOString().slice(0, 10) ?? post.data.date.toISOString().slice(0, 10));
  }

  if (posts[0]) {
    lastModified.set('/', posts[0].data.date.toISOString().slice(0, 10));
  }

  const urls = [...paths]
    .map((path) => {
      const location = new URL(path, base).href;
      const modified = lastModified.get(path);
      return `<url><loc>${escapeXml(location)}</loc>${modified ? `<lastmod>${modified}</lastmod>` : ''}</url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
