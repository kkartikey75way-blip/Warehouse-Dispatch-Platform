import { Request, Response } from "express";
import {
    getAllWarehousesService,
    findReturnWarehouseService,
    heartbeatWarehouseService,
    markWarehouseOfflineService,
    reconcileSplitBrainConflictService,
    detectSplitBrainConflictsService,
    deleteWarehouseService,
    getWarehouseInventoryService
} from "../services/warehouse.service";
import { AppError } from "../utils/appError";
import { Warehouse } from "../models/warehouse.model";

export const getWarehousesController = async (_req: Request, res: Response): Promise<void> => {
    const warehouses = await getAllWarehousesService();
    res.status(200).json({ success: true, data: warehouses });
};

export const createWarehouseController = async (req: Request, res: Response): Promise<void> => {
    const { name, code, location, zone, totalCapacity, managers } = req.body;

    if (!name || !code || !location || !zone) {
        throw new AppError("name, code, location, zone are required", 400);
    }

    const existing = await Warehouse.findOne({ code: code.toUpperCase() });
    if (existing) throw new AppError("Warehouse code already exists", 400);

    const warehouse = await Warehouse.create({
        name, code, location, zone,
        totalCapacity: totalCapacity ?? 10000,
        currentOccupancy: 0,
        isOnline: true,
        lastSeenAt: new Date(),
        managers: managers ?? []
    });

    res.status(201).json({ success: true, data: warehouse });
};

export const findReturnWarehouseController = async (req: Request, res: Response): Promise<void> => {
    const { originCode, volume, zone } = req.query as {
        originCode: string;
        volume: string;
        zone?: string;
    };

    if (!originCode || !volume) {
        throw new AppError("originCode and volume query params are required", 400);
    }

    const result = await findReturnWarehouseService(
        originCode,
        Number(volume),
        zone
    );

    res.status(200).json({ success: true, data: result });
};

export const warehouseHeartbeatController = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.params as { code: string };
    await heartbeatWarehouseService(code);
    res.status(200).json({ success: true, message: `Warehouse ${code} heartbeat recorded` });
};

export const markOfflineController = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.params as { code: string };
    await markWarehouseOfflineService(code);
    res.status(200).json({ success: true, message: `Warehouse ${code} marked offline` });
};

export const detectConflictsController = async (_req: Request, res: Response): Promise<void> => {
    const conflicts = await detectSplitBrainConflictsService();
    res.status(200).json({
        success: true,
        data: conflicts,
        conflictCount: conflicts.length
    });
};

export const reconcileConflictController = async (req: Request, res: Response): Promise<void> => {
    const { sku, warehouseCodeA, warehouseCodeB, orderIdA, orderIdB, quantityPerOrder } = req.body;

    if (!sku || !warehouseCodeA || !warehouseCodeB || !orderIdA || !orderIdB) {
        throw new AppError("sku, warehouseCodeA, warehouseCodeB, orderIdA, orderIdB are required", 400);
    }

    const result = await reconcileSplitBrainConflictService(
        sku, warehouseCodeA, warehouseCodeB,
        orderIdA, orderIdB, quantityPerOrder ?? 1
    );

    res.status(200).json({ success: true, data: result });
};

export const deleteWarehouseController = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    await deleteWarehouseService(id);
    res.status(200).json({ success: true, message: "Warehouse deleted successfully" });
};

export const getWarehouseInventoryController = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.params as { code: string };
    const inventory = await getWarehouseInventoryService(code);
    res.status(200).json({ success: true, data: inventory });
};
