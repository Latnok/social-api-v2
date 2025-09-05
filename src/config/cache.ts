import IORedis from 'ioredis';

type Json = any;

interface CacheDriver {
  get<T = Json>(key: string): Promise<T | null>;
  set(key: string, value: Json, ttlSec: number): Promise<void>;
  del(key: string): Promise<void>;
  delByPrefix(prefix: string): Promise<void>;
}

class MemoryCache implements CacheDriver {
  private store = new Map<string, { exp: number; val: string }>();
  async get<T>(key: string): Promise<T | null> {
    const row = this.store.get(key);
    if (!row) return null;
    if (row.exp < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return JSON.parse(row.val) as T;
  }
  async set(key: string, value: Json, ttlSec: number) {
    this.store.set(key, { exp: Date.now() + ttlSec * 1000, val: JSON.stringify(value) });
  }
  async del(key: string) {
    this.store.delete(key);
  }
  async delByPrefix(prefix: string) {
    for (const k of this.store.keys()) if (k.startsWith(prefix)) this.store.delete(k);
  }
}

class RedisCache implements CacheDriver {
  private r: IORedis;
  constructor(url: string) {
    this.r = new IORedis(url, { lazyConnect: true });
  }
  private async ensure() {
    if (this.r.status === 'wait' || this.r.status === 'end') await this.r.connect();
  }
  async get<T>(key: string): Promise<T | null> {
    await this.ensure();
    const v = await this.r.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }
  async set(key: string, value: Json, ttlSec: number) {
    await this.ensure();
    await this.r.set(key, JSON.stringify(value), 'EX', ttlSec);
  }
  async del(key: string) {
    await this.ensure();
    await this.r.del(key);
  }
  async delByPrefix(prefix: string) {
    await this.ensure();
    const scan = this.r.scanStream({ match: `${prefix}*`, count: 1000 });
    const pipe = this.r.pipeline();
    let pending = 0;
    await new Promise<void>((resolve, reject) => {
      scan.on('data', (keys: string[]) => {
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

export const cache: CacheDriver = process.env.REDIS_URL
  ? new RedisCache(process.env.REDIS_URL)
  : new MemoryCache();

export const seconds = (n: number) => n;
