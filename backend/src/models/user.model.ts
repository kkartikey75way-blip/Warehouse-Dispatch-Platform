import { Schema, model, Document } from "mongoose";
import { UserRole } from "../constants/roles";

export interface IUserBase {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    zone: string;
    isActive: boolean;
    isVerified: boolean;
    verificationToken?: string;
    createdAt: Date;
}

export interface IUser extends IUserBase, Document { }

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            required: true
        },
        zone: {
            type: String,
            required: true,
            index: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: {
            type: String
        }
    },
    { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
