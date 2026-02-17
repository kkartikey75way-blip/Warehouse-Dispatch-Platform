import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
    userId: Types.ObjectId;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true,
            default: "INFO"
        },
        read: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });

export const Notification = model<INotification>(
    "Notification",
    notificationSchema
);
