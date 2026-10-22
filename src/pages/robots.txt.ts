import type { APIRoute } from 'astro';
import { SITE_URL } from '../consts';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(SITE_URL);
  const sitemap = new URL('/sitemap.xml', base).href;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
