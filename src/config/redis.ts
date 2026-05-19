import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | null = null;

async function getRedisClient(): Promise<RedisClient> {
  if (client) return client;

  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    client = createClient({ url: redisUrl });
  } else {
    client = createClient({
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "6379"),
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.error("❌ Redis: max reconnection attempts reached");
            return new Error("Redis max retries exceeded");
          }
          const delay = Math.min(retries * 200, 10_000);
          console.warn(`⚠️  Redis: reconnecting in ${delay}ms (attempt ${retries})`);
          return delay;
        },
      },
    });
  }

  client.on("error", (err: Error) => console.error("❌ Redis error:", err.message));
  client.on("connect", () => console.log("✅ Redis connected"));
  client.on("reconnecting", () => console.warn("⚠️  Redis reconnecting…"));
  client.on("end", () => console.log("ℹ️  Redis connection closed"));

  await client.connect();
  return client;
}

export async function redisGet(key: string): Promise<string | null> {
  try {
    const c = await getRedisClient();
    return await c.get(key);
  } catch (err) {
    console.error(`❌ Redis GET "${key}" failed:`, err);
    return null;
  }
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds = 30
): Promise<void> {
  try {
    const item = await getRedisClient();
    await item.set(key, value, { EX: ttlSeconds });
  } catch (err) {
    console.error(`❌ Redis SET "${key}" failed:`, err);
  }
}

export async function redisDel(key: string): Promise<void> {
  try {
    const item = await getRedisClient();
    await item.del(key);
  } catch (err) {
    console.error(`❌ Redis DEL "${key}" failed:`, err);
  }
}

export async function disconnectRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
    console.log("ℹ️  Redis disconnected");
  }
}