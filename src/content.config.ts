import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1).max(120),
        date: z.coerce.date(),
        summary: z.string().min(1).max(200),
        tags: z.array(z.string().min(1)).max(5).default([]),
        updated: z.coerce.date().optional(),
        cover: image().optional(),
        coverAlt: z.string().min(1).max(200).optional(),
        cardImage: image().optional(),
        cardImageAlt: z.string().min(1).max(200).optional(),
        draft: z.boolean().default(false),
        slug: z.string().min(1).optional(),
      })
      .refine((data) => !data.cover || Boolean(data.coverAlt), {
        message: 'coverAlt is required when cover is set',
        path: ['coverAlt'],
      })
      .refine((data) => !data.cardImage || Boolean(data.cardImageAlt), {
        message: 'cardImageAlt is required when cardImage is set',
        path: ['cardImageAlt'],
      }),
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(200),
  }),
});

export const collections = { posts, pages };
