import { Request, Response } from "express";
import { groupShipmentsService } from "../services/route.service";

export const groupShipmentsController = async (req: Request, res: Response): Promise<void> => {
    const { shipmentIds } = req.body;

    if (!shipmentIds || !Array.isArray(shipmentIds) || shipmentIds.length === 0) {
        res.status(400).json({ message: "shipmentIds array is required" });
        return;
    }

    const result = await groupShipmentsService(shipmentIds);

    res.status(200).json({
        success: true,
        message: `Successfully grouped ${result.count} shipments`,
        batchId: result.batchId
    });
};
