import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

interface JwtPayload extends jwt.JwtPayload {
    userId: string;
    role: string;
    version?: number;
}

export const generateAccessToken = (payload: JwtPayload, expiresIn: string | number = "15m"): string => {
    const options = { expiresIn: expiresIn as unknown as SignOptions["expiresIn"] } as SignOptions;
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};
