import NodeCache from 'node-cache';

// In-memory cache for predictions (TTL: 5 minutes)
const predictCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const cacheKey = {
  prediction: (ticks: number[], strategy: string) => `predict:${JSON.stringify(ticks)}:${strategy}`,
};

export const cache = {
  get: <T>(key: string): T | undefined => predictCache.get<T>(key),
  set: <T>(key: string, value: T, ttl?: number) => predictCache.set(key, value, ttl),
  delete: (key: string) => predictCache.del(key),
  clear: () => predictCache.flushAll(),
  getStats: () => predictCache.getStats(),
};

export default cache;
