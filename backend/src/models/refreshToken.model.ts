import { Schema, model, Document, Types } from "mongoose";

export interface IRefreshToken extends Document {
    userId: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    version: number;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    tokenHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    version: {
        type: Number,
        default: 0
    }
});

refreshTokenSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

export const RefreshToken = model<IRefreshToken>(
    "RefreshToken",
    refreshTokenSchema
);
