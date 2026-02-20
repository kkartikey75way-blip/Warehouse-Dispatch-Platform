import { Request, Response } from "express";
import { AppError } from "../utils/appError";
import {
    completeDeliveryService,
    reportExceptionService,
    startDeliveryService
} from "../services/delivery.service";

export const startDeliveryController = async (req: Request, res: Response): Promise<void> => {
    const { shipmentId } = req.params;
    const { driverId } = req.body;

    if (!shipmentId || typeof shipmentId !== "string") {
        throw new AppError("Invalid shipment ID", 400);
    }

    const delivery = await startDeliveryService(shipmentId, driverId);

    res.status(201).json({
        success: true,
        data: delivery
    });
};

export const completeDeliveryController = async (req: Request, res: Response): Promise<void> => {
    const { shipmentId } = req.params as { shipmentId: string };
    const { signatureUrl, photoUrl } = req.body;

    if (!shipmentId) throw new AppError("Shipment ID required", 400);

    const delivery = await completeDeliveryService(shipmentId, signatureUrl, photoUrl);

    res.status(200).json({
        success: true,
        data: delivery
    });
};

export const reportExceptionController = async (req: Request, res: Response): Promise<void> => {
    const { shipmentId } = req.params as { shipmentId: string };
    const { exception } = req.body;

    if (!shipmentId) throw new AppError("Shipment ID required", 400);

    const delivery = await reportExceptionService(shipmentId, exception);

    res.status(200).json({
        success: true,
        data: delivery
    });
};
