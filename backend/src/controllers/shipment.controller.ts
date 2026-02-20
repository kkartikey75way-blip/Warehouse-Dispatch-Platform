import { Request, Response } from "express";
import { AppError } from "../utils/appError";
import {
    createShipmentService,
    updateShipmentStatusService,
    getShipmentsService,
    acceptShipmentService
} from "../services/shipment.service";
import { IShipmentFilter } from "../repositories/shipment.repository";

export const getShipmentsController = async (req: Request, res: Response): Promise<void> => {
    const filter = req.query as unknown as IShipmentFilter;
    const shipments = await getShipmentsService(filter);
    res.status(200).json({ success: true, data: shipments });
};

export const createShipmentController = async (req: Request, res: Response): Promise<void> => {
    const { trackingId, sku, quantity, type, priority, zone, origin, destination, weight, volume, slaTier } = req.body;

    const shipment = await createShipmentService(
        trackingId, sku, quantity, type, priority, zone, origin, destination, weight, volume, slaTier
    );

    res.status(201).json({ success: true, data: shipment });
};

export const updateShipmentStatusController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    if (!id) throw new AppError("Shipment ID is required", 400);

    const shipment = await updateShipmentStatusService(id, status);
    res.status(200).json({ success: true, data: shipment });
};

export const acceptShipmentController = async (req: Request, res: Response): Promise<void> => {
    const { shipmentId } = req.params as { shipmentId: string };
    const { driverId } = req.body;

    if (!shipmentId) throw new AppError("Shipment ID is required", 400);
    if (!driverId) throw new AppError("Driver ID is required", 400);

    const shipment = await acceptShipmentService(shipmentId, driverId);
    res.status(200).json({ success: true, data: shipment });
};

export const splitShipmentController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { splits } = req.body as { splits: { quantity: number; zone: string }[] };

    if (!id) throw new AppError("Shipment ID is required", 400);
    if (!splits || !splits.length) throw new AppError("Splits data is required", 400);

    const { splitShipmentService } = await import("../services/shipment.service");
    const newShipments = await splitShipmentService(id, splits);

    res.status(200).json({ success: true, data: newShipments });
};

export const blindReceiveShipmentController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { actualSku, actualQuantity } = req.body;

    if (!id) throw new AppError("Shipment ID is required", 400);

    const { blindReceiveShipmentService } = await import("../services/shipment.service");
    const shipment = await blindReceiveShipmentService(id, actualSku, Number(actualQuantity));

    res.status(200).json({ success: true, data: shipment });
};

export const exportShipmentsController = async (_req: Request, res: Response): Promise<void> => {
    const { exportToCsv } = await import("../utils/export.util");
    const shipments = await getShipmentsService({});

    const exportData = shipments.map((s) => ({
        TrackingId: s.trackingId,
        SKU: s.sku,
        Quantity: s.quantity,
        Type: s.type,
        Priority: s.priority,
        Zone: s.zone,
        Origin: s.origin,
        Destination: s.destination,
        Status: s.status,
        CreatedAt: s.createdAt.toISOString()
    }));

    exportToCsv(res, `shipments-${new Date().toISOString().split('T')[0]}.csv`, exportData);
};
