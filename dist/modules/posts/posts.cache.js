"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listKey = listKey;
exports.getCachedList = getCachedList;
exports.setCachedList = setCachedList;
exports.invalidatePostsLists = invalidatePostsLists;
const cache_1 = require("../../config/cache");
const TTL = Number(process.env.CACHE_TTL_POSTS ?? 60);
const PREFIX = 'posts:list:';
function normalize(params) {
    // ключ не должен зависеть от лишних полей
    return {
        l: Math.min(Math.max(params.limit ?? 20, 1), 100),
        c: params.cursor ?? null,
        q: params.q ?? null,
        a: params.authorId ?? null,
        ia: !!params.includeAuthor,
    };
}
function listKey(params) {
    return PREFIX + Buffer.from(JSON.stringify(normalize(params))).toString('base64url');
}
async function getCachedList(key) {
    return cache_1.cache.get(key);
}
async function setCachedList(key, payload) {
    await cache_1.cache.set(key, payload, (0, cache_1.seconds)(TTL));
}
async function invalidatePostsLists() {
    await cache_1.cache.delByPrefix(PREFIX);
}
//# sourceMappingURL=posts.cache.js.map