'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.seconds = exports.cache = void 0;
const ioredis_1 = __importDefault(require('ioredis'));
class MemoryCache {
  constructor() {
    this.store = new Map();
  }
  async get(key) {
    const row = this.store.get(key);
    if (!row) return null;
    if (row.exp < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return JSON.parse(row.val);
  }
  async set(key, value, ttlSec) {
    this.store.set(key, { exp: Date.now() + ttlSec * 1000, val: JSON.stringify(value) });
  }
  async del(key) {
    this.store.delete(key);
  }
  async delByPrefix(prefix) {
    for (const k of this.store.keys()) if (k.startsWith(prefix)) this.store.delete(k);
  }
}
class RedisCache {
  constructor(url) {
    this.r = new ioredis_1.default(url, { lazyConnect: true });
  }
  async ensure() {
    if (this.r.status === 'wait' || this.r.status === 'end') await this.r.connect();
  }
  async get(key) {
    await this.ensure();
    const v = await this.r.get(key);
    return v ? JSON.parse(v) : null;
  }
  async set(key, value, ttlSec) {
    await this.ensure();
    await this.r.set(key, JSON.stringify(value), 'EX', ttlSec);
  }
  async del(key) {
    await this.ensure();
    await this.r.del(key);
  }
  async delByPrefix(prefix) {
    await this.ensure();
    const scan = this.r.scanStream({ match: `${prefix}*`, count: 1000 });
    const pipe = this.r.pipeline();
    let pending = 0;
    await new Promise((resolve, reject) => {
      scan.on('data', (keys) => {
        keys.forEach((k) => {
          pipe.del(k);
          pending++;
        });
      });
      scan.on('end', resolve);
      scan.on('error', reject);
    });
    if (pending) await pipe.exec();
  }
}
exports.cache = process.env.REDIS_URL ? new RedisCache(process.env.REDIS_URL) : new MemoryCache();
const seconds = (n) => n;
exports.seconds = seconds;
//# sourceMappingURL=cache.js.map
