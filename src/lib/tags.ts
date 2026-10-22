/**
 * Turn a human-written tag into the URL-safe form used across the site.
 * Case, surrounding whitespace, accents, and repeated separators are removed.
 */
export function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Normalize, drop empty values, and collapse duplicates. */
export function getTagList(tags: readonly string[]): string[] {
  return [...new Set(tags.map(normalizeTag).filter(Boolean))];
}

export function tagUrl(tag: string): string {
  return `/tags/${normalizeTag(tag)}/`;
}

export function getTagCounts<T extends { data: { tags: readonly string[] } }>(posts: readonly T[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of getTagList(post.data.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return new Map([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)));
}
