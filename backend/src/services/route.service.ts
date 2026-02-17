import { Shipment } from "../models/shipment.model";
import { ShipmentStatus } from "../constants/shipmentStatus";
import { v4 as uuidv4 } from 'uuid';

export const groupShipmentsService = async (
    shipmentIds: string[]
): Promise<{ batchId: string; count: number }> => {

    const shipments = await Shipment.find({ _id: { $in: shipmentIds } });
    if (!shipments.length) throw new Error("No shipments found");

    const zones = new Set(shipments.map(s => s.zone));
    if (zones.size > 1) {
        throw new Error("Cannot group shipments from different zones. Please select shipments from the same zone for efficient routing.");
    }

    const batchId = uuidv4();

    const result = await Shipment.updateMany(
        {
            _id: { $in: shipmentIds },
            status: { $in: [ShipmentStatus.PACKED, ShipmentStatus.RECEIVED] }
        },
        {
            $set: {
                batchId: batchId
            }
        }
    );

    if (result.modifiedCount === 0) {
        throw new Error("No eligible shipments found to group.");
    }

    return { batchId, count: result.modifiedCount };
};
