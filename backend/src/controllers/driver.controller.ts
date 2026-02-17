import { Request, Response } from "express";
import { AppError } from "../utils/appError";
import {
    createDriverService,
    updateDriverAvailabilityService,
    updateDriverService,
    getAllDriversService,
    deleteDriverService
} from "../services/driver.service";

export const getDriversController = async (
    _req: Request,
    res: Response
): Promise<void> => {
    const drivers = await getAllDriversService();
    res.status(200).json({
        success: true,
        data: drivers
    });
};

export const updateDriverController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        throw new AppError("Driver ID is required", 400);
    }

    const driver = await updateDriverService(id as string, req.body);

    res.status(200).json({
        success: true,
        data: driver
    });
};

export const createDriverController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { userId, zone, capacity, shiftStart, shiftEnd } =
        req.body;

    const driver = await createDriverService(
        userId,
        zone,
        capacity,
        new Date(shiftStart),
        new Date(shiftEnd)
    );

    res.status(201).json({
        success: true,
        data: driver
    });
};

export const updateAvailabilityController =
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { isAvailable } = req.body;

        if (!id) {
            throw new AppError("Driver ID is required", 400);
        }

        const driver =
            await updateDriverAvailabilityService(
                id as string,
                isAvailable
            );

        res.status(200).json({
            success: true,
            data: driver
        });
    };
export const deleteDriverController = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    const user = req.user;

    if (!id) {
        throw new AppError("Driver ID is required", 400);
    }

    if (!user) {
        throw new AppError("Unauthorized", 401);
    }

    await deleteDriverService(id as string, user.role, user.userId);

    res.status(200).json({
        success: true,
        message: "Driver deleted successfully"
    });
};
