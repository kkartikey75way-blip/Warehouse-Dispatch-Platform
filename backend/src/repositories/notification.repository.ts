import { Notification, INotification } from "../models/notification.model";
import { Types } from "mongoose";

export const createNotification = async (
    userId: Types.ObjectId,
    title: string,
    message: string,
    type: string = "INFO"
): Promise<INotification> => {
    return Notification.create({
        userId,
        title,
        message,
        type
    });
};

export const getUserNotifications = async (
    userId: string
): Promise<INotification[]> => {
    return Notification.find({ userId }).sort({
        createdAt: -1
    });
};

export const markNotificationRead = async (
    id: string
): Promise<INotification | null> => {
    return Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
    );
};

export const getUnreadNotificationsCount = async (
    userId: string
): Promise<number> => {
    return Notification.countDocuments({
        userId,
        read: false
    });
};

export const markAllNotificationsRead = async (
    userId: string
): Promise<void> => {
    await Notification.updateMany(
        { userId, read: false },
        { read: true }
    );
};
