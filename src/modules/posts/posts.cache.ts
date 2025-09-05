import { cache, seconds } from '../../config/cache';
import type { PostsListParams } from './posts.service';

const TTL = Number(process.env.CACHE_TTL_POSTS ?? 60);
const PREFIX = 'posts:list:';

function normalize(params: PostsListParams) {
  // ключ не должен зависеть от лишних полей
  return {
    l: Math.min(Math.max(params.limit ?? 20, 1), 100),
    c: params.cursor ?? null,
    q: params.q ?? null,
    a: params.authorId ?? null,
    ia: !!params.includeAuthor,
  };
}

export function listKey(params: PostsListParams) {
  return PREFIX + Buffer.from(JSON.stringify(normalize(params))).toString('base64url');
}

export async function getCachedList(key: string) {
  return cache.get<{ items: any[]; nextCursor: string | null; hasNext: boolean }>(key);
}
export async function setCachedList(key: string, payload: any) {
  await cache.set(key, payload, seconds(TTL));
}

export async function invalidatePostsLists() {
  await cache.delByPrefix(PREFIX);
}
