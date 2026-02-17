import { Request, Response, NextFunction } from "express";
import { UserRole } from "../constants/roles";
import { AppError } from "../utils/appError";

export const authorize =
    (...allowedRoles: UserRole[]) =>
        (req: Request, _res: Response, next: NextFunction): void => {
            if (!req.user) {
                throw new AppError("Unauthorized", 401);
            }

            if (!allowedRoles.includes(req.user.role)) {
                console.error(`Access Denied: User role '${req.user.role}' is not in allowed roles: [${allowedRoles.join(", ")}]`);
                throw new AppError("Forbidden", 403);
            }

            next();
        };
