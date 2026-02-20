import { RefreshToken, IRefreshToken } from "../models/refreshToken.model";
import bcrypt from "bcrypt";

export const saveRefreshToken = async (
    userId: string,
    token: string,
    expiresAt: Date,
    version: number = 0
): Promise<void> => {
    const tokenHash = await bcrypt.hash(token, 10);

    await RefreshToken.create({
        userId,
        tokenHash,
        expiresAt,
        version
    });
};

export const findRefreshToken = async (
    userId: string
) => {
    return RefreshToken.findOne({ userId });
};

export const updateRefreshToken = async (
    userId: string,
    token: string,
    expiresAt: Date,
    newVersion: number
): Promise<void> => {
    const tokenHash = await bcrypt.hash(token, 10);
    await RefreshToken.updateOne(
        { userId },
        { tokenHash, expiresAt, version: newVersion }
    );
};

export const deleteRefreshToken = async (
    userId: string
): Promise<void> => {
    await RefreshToken.deleteOne({ userId });
};
