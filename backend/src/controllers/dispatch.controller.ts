import { Request, Response } from "express";
import {
    autoAssignDispatchService,
    getDispatchesService,
    assignBatchToDriverService
} from "../services/dispatch.service";
import { exportToCsv } from "../utils/export.util";
import { IShipment } from "../models/shipment.model";
import { IDriver } from "../models/driver.model";
import { IUser } from "../models/user.model";

interface PopulatedDispatch {
    shipmentId: IShipment;
    driverId: IDriver & { userId: IUser };
    dispatchTime: Date;
}

export const getDispatchesController = async (
    _req: Request,
    res: Response
): Promise<void> => {
    const dispatches = await getDispatchesService();
    res.status(200).json(dispatches);
};

export const exportManifestController = async (
    _req: Request,
    res: Response
): Promise<void> => {
    const dispatches = await getDispatchesService() as unknown as PopulatedDispatch[];

    const exportData = dispatches.map((d) => ({
        TrackingId: d.shipmentId?.trackingId || "N/A",
        SKU: d.shipmentId?.sku || "N/A",
        Quantity: d.shipmentId?.quantity || 0,
        Zone: d.shipmentId?.zone || "N/A",
        Origin: d.shipmentId?.origin || "N/A",
        Destination: d.shipmentId?.destination || "N/A",
        Driver: d.driverId?.userId?.name || "Unassigned",
        DispatchTime: d.dispatchTime ? new Date(d.dispatchTime).toISOString() : "N/A"
    }));

    exportToCsv(res, `manifest-${new Date().toISOString().split('T')[0]}.csv`, exportData);
};

export const autoAssignDispatchController = async (
    _req: Request,
    res: Response
): Promise<void> => {
    await autoAssignDispatchService();

    res.status(200).json({
        success: true,
        message: "Dispatch assignment completed"
    });
};

export const assignBatchController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { batchId, driverId } = req.body;

        if (!batchId || !driverId) {
            res.status(400).json({ message: "batchId and driverId are required" });
            return;
        }

        await assignBatchToDriverService(batchId, driverId);

        res.status(200).json({
            success: true,
            message: "Batch assigned to driver successfully"
        });
    } catch (error: unknown) {
        const err = error as { statusCode?: number; message?: string };
        res.status(err.statusCode || 500).json({
            message: err.message || "Failed to assign batch",
            success: false
        });
    }
};
