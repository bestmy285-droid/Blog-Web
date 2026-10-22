import type { APIRoute } from 'astro';
import { getPublishedPosts, postUrl, stripMarkdown } from '../lib/posts';
import { getTagList } from '../lib/tags';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const index = posts.map((post) => ({
    title: post.data.title,
    url: postUrl(post),
    date: post.data.date.toISOString(),
    summary: post.data.summary,
    tags: getTagList(post.data.tags),
    body: stripMarkdown(post.body ?? ''),
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
