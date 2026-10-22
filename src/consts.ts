export const SITE_TITLE = 'Blog Web';
export const SITE_TAGLINE = 'Notes on building for the web, one post at a time.';
export const SITE_DESCRIPTION =
  'A personal blog about TypeScript, CSS, performance, accessibility, and the craft of building for the web.';
export const SITE_URL = 'https://blog-web.example.com';
export const AUTHOR_NAME = 'Blog Web';
export const AUTHOR_EMAIL = 'hello@example.com';

export const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/your-handle',
  },
] as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Archive', href: '/archive/' },
  { label: 'Tags', href: '/tags/' },
  { label: 'About', href: '/about/' },
  { label: 'Search', href: '/search/' },
] as const;
