import {
    createShipment,
    findShipmentByTrackingId,
    updateShipmentStatus,
    findShipmentById,
    getShipments,
    IShipmentFilter
} from "../repositories/shipment.repository";
import { ShipmentStatus } from "../constants/shipmentStatus";
import { ShipmentPriority } from "../constants/priorities";
import { ShipmentType } from "../constants/shipmentType";
import { AppError } from "../utils/appError";
import { IShipment } from "../models/shipment.model";

export const getShipmentsService = async (filter: IShipmentFilter = {}) => {
    return getShipments(filter);
};

export const createShipmentService = async (
    trackingId: string,
    sku: string,
    quantity: number,
    type: ShipmentType,
    priority: ShipmentPriority,
    zone: string,
    origin: string,
    destination: string,
    weight: number,
    volume: number,
    slaTier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" = "BRONZE"
) => {
    const existing = await findShipmentByTrackingId(
        trackingId
    );

    if (existing) {
        throw new AppError("Tracking ID already exists", 400);
    }

    const status =
        type === ShipmentType.INBOUND
            ? ShipmentStatus.RECEIVED
            : ShipmentStatus.PACKED;

    
    const now = new Date();
    const deadline = new Date(now);
    switch (slaTier) {
        case "PLATINUM":
            deadline.setHours(now.getHours() + 4);
            break;
        case "GOLD":
            deadline.setHours(now.getHours() + 12);
            break;
        case "SILVER":
            deadline.setHours(now.getHours() + 24);
            break;
        case "BRONZE":
        default:
            deadline.setHours(now.getHours() + 48);
            break;
    }

    return createShipment({
        trackingId,
        sku,
        quantity,
        type,
        priority,
        status,
        zone,
        origin,
        destination,
        weight,
        volume,
        slaTier,
        slaDeadline: deadline,
        locationHistory: [],
        statusHistory: [{
            status,
            timestamp: new Date(),
            notes: "Shipment created"
        }]
    });
};

export const updateShipmentStatusService = async (
    id: string,
    status: ShipmentStatus
) => {
    const shipment = await findShipmentById(id);

    if (!shipment) {
        throw new AppError("Shipment not found", 404);
    }


    const validTransitions: Record<
        ShipmentStatus,
        ShipmentStatus[]
    > = {
        RECEIVED: [ShipmentStatus.PACKED],
        PACKED: [ShipmentStatus.DISPATCHED],
        DISPATCHED: [ShipmentStatus.IN_TRANSIT],
        IN_TRANSIT: [ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERED],
        OUT_FOR_DELIVERY: [ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED],
        DELIVERED: [],
        RETURNED: []
    };

    if (!validTransitions[shipment.status].includes(status)) {
        throw new AppError(
            `Invalid status transition from ${shipment.status} to ${status}`,
            400
        );
    }

    return updateShipmentStatus(id, status);
};

export const acceptShipmentService = async (
    shipmentId: string,
    driverId: string
) => {
    const shipment = await findShipmentById(shipmentId);

    if (!shipment) {
        throw new AppError("Shipment not found", 404);
    }

    if (shipment.status !== ShipmentStatus.DISPATCHED) {
        throw new AppError("Only dispatched shipments can be accepted", 400);
    }

    if (String(shipment.assignedDriverId) !== driverId) {
        throw new AppError("Shipment not assigned to this driver", 403);
    }

    if (shipment.acceptedByDriver) {
        throw new AppError("Shipment already accepted", 400);
    }

    shipment.acceptedByDriver = true;
    shipment.acceptedAt = new Date();
    await shipment.save();

    return shipment;
};


export const splitShipmentService = async (
    id: string,
    splits: { quantity: number; zone: string }[]
): Promise<IShipment[]> => {
    const parent = await findShipmentById(id);
    if (!parent) throw new AppError("Parent shipment not found", 404);

    const totalSplitQuantity = splits.reduce((sum, s) => sum + s.quantity, 0);
    if (totalSplitQuantity > parent.quantity) {
        throw new AppError("Split quantity exceeds parent shipment quantity", 400);
    }

    const newShipments: IShipment[] = [];

    for (const split of splits) {
        const trackingId = `${parent.trackingId}-S${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

        const newShipment = await createShipment({
            ...parent.toObject(),
            _id: undefined,
            trackingId,
            quantity: split.quantity,
            zone: split.zone,
            status: ShipmentStatus.PACKED,
            statusHistory: [{
                status: ShipmentStatus.PACKED,
                timestamp: new Date(),
                notes: `Split from parent shipment ${parent.trackingId}`
            }]
        });
        newShipments.push(newShipment);
    }

    
    if (totalSplitQuantity === parent.quantity) {
        await parent.deleteOne();
    } else {
        parent.quantity -= totalSplitQuantity;
        parent.statusHistory.push({
            status: parent.status,
            timestamp: new Date(),
            notes: `Reduced quantity by ${totalSplitQuantity} due to split`
        });
        await parent.save();
    }

    return newShipments;
};
