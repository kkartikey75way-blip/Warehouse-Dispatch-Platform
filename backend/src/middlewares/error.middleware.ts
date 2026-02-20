import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { logger } from "../utils/logger";

export const errorMiddleware = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err instanceof AppError ? err.message : "Internal Server Error";

    if (statusCode >= 500) {
        logger.error({
            message: "Unhandled error",
            error: err,
            stack: err instanceof Error ? err.stack : undefined
        });
    } else {
        logger.warn({
            message,
            statusCode
        });
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "development" && err instanceof Error ? err.stack : undefined
    });
};
