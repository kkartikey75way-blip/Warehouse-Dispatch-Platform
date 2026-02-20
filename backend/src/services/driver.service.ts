import { Types } from "mongoose";
import { User } from "../models/user.model";
import { UserRole } from "../constants/roles";
import {
    createDriver,
    findDriverByUserId,
    updateDriverAvailability,
    updateDriverLoad,
    updateDriver,
    deleteDriverById,
    startDriverBreak,
    endDriverBreak
} from "../repositories/driver.repository";

export { findDriverByUserId };
import { AppError } from "../utils/appError";
import { Driver, DriverShift } from "../models/driver.model";

export const createDriverService = async (
    userId: string,
    zone: string,
    capacity: number,
    shiftStart: Date,
    shiftEnd: Date
) => {
    const existing = await findDriverByUserId(userId);

    if (existing) {
        throw new AppError("Driver already exists", 400);
    }

    if (shiftStart >= shiftEnd) {
        throw new AppError("Invalid shift timing", 400);
    }

    return createDriver({
        userId: new Types.ObjectId(userId),
        zone,
        capacity,
        currentLoad: 0,
        isAvailable: true,
        shift: DriverShift.MORNING,
        shiftStart,
        shiftEnd,
        cumulativeDrivingTime: 0,
        continuousDrivingTime: 0
    });
};

export const updateDriverAvailabilityService = async (
    id: string,
    isAvailable: boolean
) => {
    const driver = await updateDriverAvailability(
        id,
        isAvailable
    );

    if (!driver) {
        throw new AppError("Driver not found", 404);
    }

    return driver;
};

export const assignLoadToDriverService = async (
    id: string,
    additionalLoad: number
) => {
    const driver = await updateDriverLoad(
        id,
        additionalLoad
    );

    if (!driver) {
        throw new AppError("Driver not found", 404);
    }

    if (driver.currentLoad > driver.capacity) {
        throw new AppError(
            "Driver capacity exceeded",
            400
        );
    }

    return driver;
};

export const updateDriverService = async (
    id: string,
    updates: Partial<{
        zone: string;
        capacity: number;
        shiftStart: Date;
        shiftEnd: Date;
    }>
) => {
    const driver = await updateDriver(id, updates);

    if (!driver) {
        throw new AppError("Driver not found", 404);
    }

    return driver;
};


export const getAllDriversService = async () => {

    const driverUsers = await User.find({ role: UserRole.DRIVER });
    const existingDrivers = await Driver.find();

    const existingUserIds = new Set(existingDrivers.map(d => d.userId.toString()));

    const missingDrivers = driverUsers.filter(u => !existingUserIds.has(u._id.toString()));

    if (missingDrivers.length > 0) {
        console.log(`Creating ${missingDrivers.length} missing driver profiles...`);
        const now = new Date();
        const shiftEnd = new Date(now.getTime() + 8 * 60 * 60 * 1000);

        await Promise.all(missingDrivers.map(user =>
            createDriver({
                userId: user._id as Types.ObjectId,
                zone: user.zone || 'Default',
                capacity: 500,
                currentLoad: 0,
                isAvailable: true,
                shift: DriverShift.MORNING,
                shiftStart: now,
                shiftEnd: shiftEnd,
                cumulativeDrivingTime: 0,
                continuousDrivingTime: 0
            })
        ));
    }

    return Driver.find().populate("userId").exec();
};
export const deleteDriverService = async (
    id: string,
    requesterRole: string,
    requesterId: string
) => {
    const driver = await Driver.findById(id);

    if (!driver) {
        throw new AppError("Driver profile not found", 404);
    }


    const isOwner = driver.userId.toString() === requesterId;
    const isAdmin = requesterRole === UserRole.ADMIN || requesterRole === UserRole.WAREHOUSE_MANAGER;

    if (!isOwner && !isAdmin) {
        throw new AppError("You are not authorized to delete this account", 403);
    }


    await User.findByIdAndDelete(driver.userId);


    await deleteDriverById(id);

    return { message: "Driver and associated user account deleted successfully" };
};

export const startDriverBreakService = async (driverId: string) => {
    const driver = await startDriverBreak(driverId);
    if (!driver) throw new AppError("Driver not found", 404);
    return driver;
};

export const endDriverBreakService = async (driverId: string) => {
    const driver = await endDriverBreak(driverId);
    if (!driver) throw new AppError("Driver not found", 404);
    return driver;
};
