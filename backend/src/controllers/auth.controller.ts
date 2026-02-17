import { Request, Response } from "express";
import {
    registerService,
    loginService,
    refreshTokenService,
    verifyEmailService
} from "../services/auth.service";
import { AppError } from "../utils/appError";

import { UserRole } from "../constants/roles";

export const registerController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { name, email, password, role, zone } = req.body;

    const user = await registerService(
        name,
        email,
        password,
        role as UserRole,
        zone
    );

    res.status(201).json(user);
};

export const loginController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { email, password } = req.body;

    const result = await loginService(email, password);

    res.status(200).json(result);
};

export const refreshController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { refreshToken } = req.body;

    const tokens = await refreshTokenService(refreshToken);

    res.status(200).json(tokens);
};

export const verifyEmailController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { token } = req.query as { token: string };

    if (!token) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_required`);
    }

    try {
        await verifyEmailService(token);
        res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    } catch (error: unknown) {
        console.error("Verification error:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=verification_failed`);
    }
};
