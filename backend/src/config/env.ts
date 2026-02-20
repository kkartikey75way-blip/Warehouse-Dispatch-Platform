import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("5000"),
    MONGO_URI: z.string(),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    REDIS_URL: z.string().default("redis://localhost:6379"),
    FRONTEND_URL: z.string().default("http://localhost:3000"),
    BACKEND_URL: z.string().default("http://localhost:5000"),
    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.string(),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
    EMAIL_FROM: z.string()
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    process.exit(1);
}

export const env = _env.data;
