import { Shipment, IShipment, IShipmentBase } from "../models/shipment.model";
import { Types } from "mongoose";
import { ShipmentStatus } from "../constants/shipmentStatus";
import { ShipmentPriority } from "../constants/priorities";

const priorityOrder: Record<string, number> = {
    [ShipmentPriority.EXPRESS]: 1,
    [ShipmentPriority.STANDARD]: 2,
    [ShipmentPriority.BULK]: 3
};

export interface IShipmentFilter {
    status?: ShipmentStatus | ShipmentStatus[];
    type?: string;
    priority?: string;
    trackingId?: string;
    zone?: string;
    assignedDriverId?: Types.ObjectId | string;
}

export const createShipment = async (
    data: Omit<IShipmentBase, "_id" | "createdAt" | "updatedAt">
): Promise<IShipment> => {
    return Shipment.create(data);
};

export const getShipments = async (filter: IShipmentFilter = {}): Promise<IShipment[]> => {

    const shipments = await Shipment.find(filter);

    return shipments.sort((a, b) => {
        const pA = priorityOrder[a.priority] || 99;
        const pB = priorityOrder[b.priority] || 99;

        if (pA !== pB) return pA - pB;
        return b.createdAt.getTime() - a.createdAt.getTime();
    });
};

export const findShipmentById = async (
    id: string
): Promise<IShipment | null> => {
    return Shipment.findById(id);
};

export const findShipmentByTrackingId = async (
    trackingId: string
): Promise<IShipment | null> => {
    return Shipment.findOne({ trackingId });
};

export const updateShipmentStatus = async (
    id: string,
    status: ShipmentStatus
): Promise<IShipment | null> => {
    return Shipment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );
};

export const getPendingOutboundShipments = async (): Promise<IShipment[]> => {
    const shipments = await Shipment.find({
        type: "OUTBOUND",
        status: { $in: [ShipmentStatus.PACKED, ShipmentStatus.RECEIVED] },
        assignedDriverId: { $exists: false }
    });

    return shipments.sort((a, b) => {
        const pA = priorityOrder[a.priority] || 99;
        const pB = priorityOrder[b.priority] || 99;

        if (pA !== pB) return pA - pB;
        return b.createdAt.getTime() - a.createdAt.getTime();
    });
};

export const bulkMarkAsDispatched = async (
    shipmentIds: Types.ObjectId[],
    driverId: Types.ObjectId
): Promise<void> => {
    await Shipment.updateMany(
        { _id: { $in: shipmentIds } },
        {
            status: ShipmentStatus.DISPATCHED,
            assignedDriverId: driverId
        }
    );
};

export const getShipmentsByBatchId = async (
    batchId: string
): Promise<IShipment[]> => {
    return Shipment.find({ batchId });
};
