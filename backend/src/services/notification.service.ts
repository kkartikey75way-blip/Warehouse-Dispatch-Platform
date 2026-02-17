import { eventBus } from "../utils/eventBus";
import { createNotification } from "../repositories/notification.repository";
import { Types } from "mongoose";
import { Driver } from "../models/driver.model";
import { User } from "../models/user.model";
import { UserRole } from "../constants/roles";

const getDriverUserId = async (driverId: string) => {
    const driver = await Driver.findById(driverId);
    return driver?.userId;
};

const notifyManagers = async (title: string, message: string, type: string = "URGENT") => {
    const managers = await User.find({ role: UserRole.WAREHOUSE_MANAGER });
    for (const manager of managers) {
        await createNotification(
            manager._id as Types.ObjectId,
            title,
            message,
            type
        );
    }
};

eventBus.on(
    "dispatch_assigned",
    async (data: { driverId: string; shipmentCount: number }) => {
        try {
            console.log("[NOTIFICATION] dispatch_assigned event received:", data);
            const userId = await getDriverUserId(data.driverId);
            if (userId) {
                const notification = await createNotification(
                    userId as Types.ObjectId,
                    "New Dispatch Assigned",
                    `You have ${data.shipmentCount} new shipments assigned to your route`,
                    "INFO"
                );
                console.log("[NOTIFICATION] Created dispatch notification:", notification._id);
            } else {
                console.warn("[NOTIFICATION] Driver userId not found for driverId:", data.driverId);
            }
        } catch (error) {
            console.error("[NOTIFICATION] Error creating dispatch notification:", error);
        }
    }
);

eventBus.on(
    "delivery_completed",
    async (data: { driverId: string; shipmentId: string }) => {
        try {
            console.log("[NOTIFICATION] delivery_completed event received:", data);
            const userId = await getDriverUserId(data.driverId);
            if (userId) {
                const notification = await createNotification(
                    userId as Types.ObjectId,
                    "Delivery Completed",
                    `Shipment ${data.shipmentId} delivered successfully`,
                    "SUCCESS"
                );
                console.log("[NOTIFICATION] Created delivery completion notification:", notification._id);
            } else {
                console.warn("[NOTIFICATION] Driver userId not found for driverId:", data.driverId);
            }
        } catch (error) {
            console.error("[NOTIFICATION] Error creating delivery completion notification:", error);
        }
    }
);

eventBus.on(
    "delivery_exception",
    async (data: { driverId: string; shipmentId: string }) => {
        try {
            console.log("[NOTIFICATION] delivery_exception event received:", data);
            const userId = await getDriverUserId(data.driverId);
            if (userId) {
                const notification = await createNotification(
                    userId as Types.ObjectId,
                    "Delivery Exception",
                    `Urgent: Shipment ${data.shipmentId} had an exception`,
                    "URGENT"
                );
                console.log("[NOTIFICATION] Created driver exception notification:", notification._id);
            } else {
                console.warn("[NOTIFICATION] Driver userId not found for driverId:", data.driverId);
            }


            await notifyManagers(
                "Urgent: Delivery Exception",
                `Driver reported an issue with shipment ${data.shipmentId}`,
                "URGENT"
            );
            console.log("[NOTIFICATION] Notified managers of delivery exception");
        } catch (error) {
            console.error("[NOTIFICATION] Error creating delivery exception notification:", error);
        }
    }
);
