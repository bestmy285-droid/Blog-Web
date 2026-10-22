import { getCollection, type CollectionEntry } from 'astro:content';
import { getTagList } from './tags';

export type Post = CollectionEntry<'posts'>;

export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');

  return posts.sort((a, b) => {
    const dateDifference = b.data.date.valueOf() - a.data.date.valueOf();
    return dateDifference !== 0 ? dateDifference : a.data.title.localeCompare(b.data.title);
  });
}

/** Posts that may appear in production, RSS, sitemaps, and the search index. */
export async function getPublishedPosts(): Promise<Post[]> {
  return (await getAllPosts()).filter((post) => !post.data.draft);
}

/** Posts visible on the site. Drafts are included only while developing locally. */
export async function getPostsForDisplay(): Promise<Post[]> {
  const posts = await getAllPosts();
  return import.meta.env.PROD ? posts.filter((post) => !post.data.draft) : posts;
}

export function postUrl(post: Post): string {
  return `/posts/${post.id}/`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Remove markup and code so word counts and search text reflect prose only. */
export function stripMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^import\s.+$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getReadingTime(post: Post): number {
  const text = stripMarkdown(post.body ?? '');
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200));
}

export async function getRelatedPosts(current: Post, limit = 3): Promise<Post[]> {
  const posts = await getPublishedPosts();
  const currentTags = new Set(getTagList(current.data.tags));

  const ranked = posts
    .filter((post) => post.id !== current.id)
    .map((post) => ({
      post,
      shared: getTagList(post.data.tags).filter((tag) => currentTags.has(tag)).length,
    }))
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => {
      const tagDifference = b.shared - a.shared;
      return tagDifference !== 0 ? tagDifference : b.post.data.date.valueOf() - a.post.data.date.valueOf();
    });

  const related = ranked.slice(0, limit).map((entry) => entry.post);

  if (related.length < limit) {
    for (const post of posts) {
      if (post.id === current.id || related.some((entry) => entry.id === post.id)) {
        continue;
      }

      related.push(post);

      if (related.length === limit) {
        break;
      }
    }
  }

  return related;
}
