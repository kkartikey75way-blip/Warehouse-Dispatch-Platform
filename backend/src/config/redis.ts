import Redis from "ioredis";
import { env } from "./env";

export const redisClient = new Redis(env.REDIS_URL);

redisClient.on("connect", () => {
    
});

redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});
