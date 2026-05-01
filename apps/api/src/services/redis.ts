import Redis from "ioredis";
import { REDIS_CONNECTION_STATUS } from "../shared/constants/redis";

const REDIS_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000,
  KEEP_ALIVE: 30000,
  FAMILY: 4,
} as const;

class RedisClient {
  private static instance: RedisClient;
  private client: Redis;
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASS,
      connectTimeout: REDIS_CONFIG.TIMEOUT,
      maxRetriesPerRequest: REDIS_CONFIG.RETRY_ATTEMPTS,
      keepAlive: REDIS_CONFIG.KEEP_ALIVE,
      family: REDIS_CONFIG.FAMILY,
      lazyConnect: false,
      retryStrategy: (times) => {
        if (times >= REDIS_CONFIG.RETRY_ATTEMPTS) {
          return null;
        }
        return REDIS_CONFIG.RETRY_DELAY;
      },
    });
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on(REDIS_CONNECTION_STATUS.CONNECT, () => {
      this.logConnectionEvent("Redis connected successfully");
    });

    this.client.on(REDIS_CONNECTION_STATUS.DISCONNECT, () => {
      this.logConnectionEvent("Redis connection lost");
    });

    this.client.on(REDIS_CONNECTION_STATUS.RECONNECT, () => {
      this.logConnectionEvent("Redis attempting reconnection");
    });

    this.client.on(REDIS_CONNECTION_STATUS.ERROR, (error) => {
      this.logConnectionEvent("Redis connection error", error);
    });
  }

  public async getKey(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      return null;
    }
  }

  public async setKey(
    key: string,
    value: string,
    expireInSeconds?: number,
  ): Promise<"OK" | null> {
    try {
      if (expireInSeconds) {
        return await this.client.set(key, value, "EX", expireInSeconds);
      } else {
        return await this.client.set(key, value);
      }
    } catch (error) {
      return null;
    }
  }

  public async deleteKey(key: string): Promise<number | null> {
    try {
      return await this.client.del(key);
    } catch (error) {
      return null;
    }
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async isHealthy(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === "PONG";
    } catch (error) {
      return false;
    }
  }

  private logConnectionEvent(message: string, error?: Error): void {
    if (error) {
      console.error(`[Redis] ${message}:`, error);
    } else {
      console.info(`[Redis] ${message}`);
    }
  }
}

export const redisClient = RedisClient.getInstance();
