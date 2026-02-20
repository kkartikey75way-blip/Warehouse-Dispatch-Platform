import { Request, Response } from "express";
import {
    getUserNotifications,
    markNotificationRead
} from "../repositories/notification.repository";
import { AppError } from "../utils/appError";

export const getNotificationsController = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const notifications = await getUserNotifications(req.user.userId);
    res.status(200).json({ success: true, data: notifications });
};

export const markReadController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    if (!id) throw new AppError("Notification ID required", 400);

    const notification = await markNotificationRead(id);
    res.status(200).json({ success: true, data: notification });
};

export const getUnreadCountController = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const { getUnreadNotificationsCount } = await import("../repositories/notification.repository");
    const count = await getUnreadNotificationsCount(req.user.userId);

    res.status(200).json({ success: true, data: { count } });
};

export const markAllReadController = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const { markAllNotificationsRead } = await import("../repositories/notification.repository");
    await markAllNotificationsRead(req.user.userId);

    res.status(200).json({ success: true, data: { message: "All notifications marked as read" } });
};
