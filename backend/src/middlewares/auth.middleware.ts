import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/appError";
import { UserRole } from "../constants/roles";

export const protect = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Not authorized", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        throw new AppError("Not authorized", 401);
    }

    try {
        const decoded = verifyAccessToken(token);

        req.user = {
            userId: decoded.userId,
            role: decoded.role as UserRole
        };

        next();
    } catch (err: unknown) {
        if (err instanceof Error && err.name === "TokenExpiredError") {
            
            const decodedInsecure = verifyAccessToken(token, true);
            const expiredAt = (err as { expiredAt?: Date }).expiredAt?.getTime() || 0;
            const now = Date.now();
            const graceThreshold = 5 * 60 * 1000; 

            if (now - expiredAt <= graceThreshold) {
                req.user = {
                    userId: decodedInsecure.userId,
                    role: decodedInsecure.role as UserRole
                };
                return next();
            }
        }
        throw new AppError("Invalid or expired token", 401);
    }
}
