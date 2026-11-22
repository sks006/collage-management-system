import { Provider, Logger } from "@nestjs/common";
import Redis from "ioredis";

export const REDIS_CLIENT = "REDIS_CLIENT";

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
    const logger = new Logger("RedisProvider");
    const client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 5) return null;
        return Math.min(times * 100, 2000);
      },
    });

    client.on("error", (err) => {
      logger.warn(`Redis connection notice: ${err.message}`);
    });

    return client;
  },
};
