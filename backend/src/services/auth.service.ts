import { createUser, findUserByEmail, findUserById, updateUserVerification } from "../repositories/user.repository";
import {
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken
} from "../repositories/refreshToken.repository";
import { IUser } from "../models/user.model";
import { hashPassword, comparePassword } from "../utils/password";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from "../utils/jwt";
import { AppError } from "../utils/appError";
import { UserRole } from "../constants/roles";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/email.util";
import { User } from "../models/user.model";

import { createDriver } from "../repositories/driver.repository";
import { DriverShift } from "../models/driver.model";

export const registerService = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    zone: string
) => {
    const existing = await findUserByEmail(email);

    if (existing) {
        throw new AppError("Email already exists", 400);
    }

    const hashed = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await createUser({
        name,
        email,
        password: hashed,
        role,
        zone,
        isActive: true,
        isVerified: false,
        verificationToken
    });

    if (role === UserRole.DRIVER) {
        const now = new Date();
        const shiftEnd = new Date(now);
        shiftEnd.setHours(now.getHours() + 8);

        await createDriver({
            userId: user._id,
            zone,
            capacity: 500,
            currentLoad: 0,
            isAvailable: false,
            shift: DriverShift.MORNING,
            shiftStart: now,
            shiftEnd: shiftEnd
        });
    }

    await sendVerificationEmail(email, verificationToken);

    return user;
};

export const loginService = async (
    email: string,
    password: string
) => {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }

    const valid = await comparePassword(
        password,
        user.password
    );

    if (!valid) {
        throw new AppError("Invalid credentials", 401);
    }

    if (!user.isVerified) {
        throw new AppError("Please verify your email before logging in", 403);
    }

    const payload = {
        userId: user._id.toString(),
        role: user.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await deleteRefreshToken(user._id.toString());

    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await saveRefreshToken(
        user._id.toString(),
        refreshToken,
        expiresAt
    );

    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            zone: user.zone
        }
    };
};

export const refreshTokenService = async (
    token: string
) => {
    const payload = verifyRefreshToken(token);

    const stored = await findRefreshToken(payload.userId);

    if (!stored) {
        throw new AppError("Invalid refresh token", 401);
    }

    const isValid = await bcrypt.compare(
        token,
        stored.tokenHash
    );

    if (!isValid) {
        throw new AppError("Invalid refresh token", 401);
    }

    await deleteRefreshToken(payload.userId);

    const newAccess = generateAccessToken(payload);
    const newRefresh = generateRefreshToken(payload);

    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await saveRefreshToken(
        payload.userId,
        newRefresh,
        expiresAt
    );

    const user = await findUserById(payload.userId);

    return {
        newAccess,
        newRefresh,
        user: user ? {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            zone: user.zone
        } : null
    };
};

export const verifyEmailService = async (token: string) => {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        throw new AppError("Invalid or expired verification token", 400);
    }

    user.isVerified = true;
    user.set("verificationToken", undefined);
    await user.save();

    return user;
};
