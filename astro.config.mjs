import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Change this to the real domain before launch. It is used for canonical URLs,
// Open Graph URLs, RSS links, and the sitemap.
export default defineConfig({
  site: 'https://blog-web.example.com',
  trailingSlash: 'ignore',
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light-high-contrast',
        dark: 'github-dark-high-contrast',
      },
      defaultColor: false,
      wrap: true,
    },
  },
});
