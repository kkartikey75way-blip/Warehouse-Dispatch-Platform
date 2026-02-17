import { redisClient } from "../config/redis";

export const getCache = async <T>(
    key: string
): Promise<T | null> => {
    const data = await redisClient.get(key);

    if (!data) return null;

    return JSON.parse(data) as T;
};

export const setCache = async (
    key: string,
    value: unknown,
    ttlSeconds: number
): Promise<void> => {
    await redisClient.set(
        key,
        JSON.stringify(value),
        "EX",
        ttlSeconds
    );
};

export const deleteCache = async (
    key: string
): Promise<void> => {
    await redisClient.del(key);
};
