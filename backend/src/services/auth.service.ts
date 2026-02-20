import { createUser, findUserByEmail, findUserById, updateUserVerification } from "../repositories/user.repository";
import {
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
    updateRefreshToken
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

import { createDriver, findDriverByUserId, updateDriver } from "../repositories/driver.repository";
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
            shiftEnd: shiftEnd,
            cumulativeDrivingTime: 0,
            continuousDrivingTime: 0
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
        role: user.role,
        version: 0
    };

    let expiresIn: string | number = "15m";
    if (user.role === UserRole.DRIVER) {
        const driver = await findDriverByUserId(user._id.toString());
        if (driver && driver.shiftEnd) {
            let remainingShiftTimeMs = driver.shiftEnd.getTime() - Date.now();

            if (remainingShiftTimeMs <= 0) {
                const now = new Date();
                const newShiftEnd = new Date(now);
                newShiftEnd.setHours(now.getHours() + 8);

                await updateDriver(driver._id.toString(), {
                    shiftStart: now,
                    shiftEnd: newShiftEnd,
                    isAvailable: true
                });
                remainingShiftTimeMs = newShiftEnd.getTime() - now.getTime();
            }

            expiresIn = Math.floor(remainingShiftTimeMs / 1000);
        }
    }

    const accessToken = generateAccessToken(payload, expiresIn);
    const refreshToken = generateRefreshToken(payload);

    await deleteRefreshToken(user._id.toString());

    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await saveRefreshToken(
        user._id.toString(),
        refreshToken,
        expiresAt,
        0
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
    const tokenVersion = payload.version || 0;

    const stored = await findRefreshToken(payload.userId);

    if (!stored) {
        throw new AppError("Invalid refresh token", 401);
    }


    if (stored.version > tokenVersion) {
        await deleteRefreshToken(payload.userId);
        throw new AppError("Refresh token has been reused. All sessions invalidated.", 403);
    }

    const isValid = await bcrypt.compare(
        token,
        stored.tokenHash
    );

    if (!isValid) {
        throw new AppError("Invalid refresh token", 401);
    }

    let expiresIn: string | number = "15m";
    if (payload.role === UserRole.DRIVER) {
        const driver = await findDriverByUserId(payload.userId);
        if (driver && driver.shiftEnd) {
            let remainingShiftTimeMs = driver.shiftEnd.getTime() - Date.now();

            if (remainingShiftTimeMs <= 0) {
                const now = new Date();
                const newShiftEnd = new Date(now);
                newShiftEnd.setHours(now.getHours() + 8);

                await updateDriver(driver._id.toString(), {
                    shiftStart: now,
                    shiftEnd: newShiftEnd,
                    isAvailable: true
                });
                remainingShiftTimeMs = newShiftEnd.getTime() - now.getTime();
            }

            expiresIn = Math.floor(remainingShiftTimeMs / 1000);
        }
    }

    const newVersion = tokenVersion + 1;
    const newPayload = { ...payload, version: newVersion };

    const newAccess = generateAccessToken(newPayload, expiresIn);
    const newRefresh = generateRefreshToken(newPayload);

    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    const { updateRefreshToken: updateToken } = await import("../repositories/refreshToken.repository");
    await updateToken(
        payload.userId,
        newRefresh,
        expiresAt,
        newVersion
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
