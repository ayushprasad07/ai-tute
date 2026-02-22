import { redis } from "./redis";

interface RateLimitOptions {
  limit: number;
  window: number; // seconds
}

export async function rateLimit(
  key: string,
  options: RateLimitOptions
) {
  const { limit, window } = options;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, window);
  }

  if (current > limit) {
    return {
      success: false,
      remaining: 0,
    };
  }

  return {
    success: true,
    remaining: limit - current,
  };
}