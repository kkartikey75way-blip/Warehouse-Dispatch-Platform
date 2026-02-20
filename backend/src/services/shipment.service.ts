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
import { IShipment, Shipment } from "../models/shipment.model";
import { getInventoryBySku, reserveStock, releaseStock, updateStock } from "../repositories/inventory.repository";

const priorityOrder: Record<string, number> = {
    [ShipmentPriority.EXPRESS]: 1,
    [ShipmentPriority.STANDARD]: 2,
    [ShipmentPriority.BULK]: 3
};

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
    const existing = await findShipmentByTrackingId(trackingId);
    if (existing) throw new AppError("Tracking ID already exists", 400);

    let status = type === ShipmentType.INBOUND ? ShipmentStatus.PENDING : ShipmentStatus.PACKED;
    const now = new Date();
    const deadline = new Date(now);

    switch (slaTier) {
        case "PLATINUM": deadline.setHours(now.getHours() + 4); break;
        case "GOLD": deadline.setHours(now.getHours() + 12); break;
        case "SILVER": deadline.setHours(now.getHours() + 24); break;
        case "BRONZE":
        default: deadline.setHours(now.getHours() + 48); break;
    }

    if (type === ShipmentType.OUTBOUND) {
        const inv = await getInventoryBySku(sku);
        const available = inv ? inv.onHand - inv.reserved : 0;

        if (available < quantity) {
            const currentPriorityValue = priorityOrder[priority] ?? 99;
            const lowerPriorityShipments = await Shipment.find({
                sku,
                type: ShipmentType.OUTBOUND,
                status: ShipmentStatus.PACKED,
                priority: {
                    $in: Object.keys(priorityOrder).filter(p => (priorityOrder[p] ?? 0) > currentPriorityValue)
                }
            }).sort({ priority: -1, createdAt: -1 });

            let releasing = 0;
            const toPreempt = [];
            for (const s of lowerPriorityShipments) {
                releasing += s.quantity;
                toPreempt.push(s);
                if (available + releasing >= quantity) break;
            }

            if (available + releasing >= quantity) {
                for (const s of toPreempt) {
                    s.status = ShipmentStatus.PENDING;
                    s.statusHistory.push({
                        status: ShipmentStatus.PENDING,
                        timestamp: new Date(),
                        notes: `Preempted by higher priority order (${trackingId})`
                    });
                    await s.save();
                    await releaseStock(sku, s.quantity);
                }
                status = ShipmentStatus.PACKED;
                await reserveStock(sku, quantity);
            } else {
                status = ShipmentStatus.PENDING;
            }
        } else {
            await reserveStock(sku, quantity);
        }
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

export const updateShipmentStatusService = async (id: string, status: ShipmentStatus) => {
    const shipment = await findShipmentById(id);
    if (!shipment) throw new AppError("Shipment not found", 404);

    const validTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
        PENDING: [ShipmentStatus.RECEIVED, ShipmentStatus.DISPUTED],
        RECEIVED: [ShipmentStatus.PACKED],
        PACKED: [ShipmentStatus.DISPATCHED],
        DISPATCHED: [ShipmentStatus.IN_TRANSIT],
        IN_TRANSIT: [ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERED],
        OUT_FOR_DELIVERY: [ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED],
        DELIVERED: [],
        RETURNED: [],
        DISPUTED: [ShipmentStatus.RECEIVED, ShipmentStatus.RETURNED]
    };

    if (!validTransitions[shipment.status].includes(status)) {
        throw new AppError(`Invalid status transition from ${shipment.status} to ${status}`, 400);
    }

    return updateShipmentStatus(id, status);
};

export const acceptShipmentService = async (shipmentId: string, driverId: string) => {
    const shipment = await findShipmentById(shipmentId);
    if (!shipment) throw new AppError("Shipment not found", 404);

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

export const splitShipmentService = async (id: string, splits: { quantity: number; zone: string }[]): Promise<IShipment[]> => {
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

export const blindReceiveShipmentService = async (id: string, actualSku: string, actualQuantity: number) => {
    const shipment = await findShipmentById(id);
    if (!shipment) throw new AppError("Shipment not found", 404);

    if (shipment.type !== ShipmentType.INBOUND) {
        throw new AppError("Only inbound shipments can be received", 400);
    }

    shipment.expectedQuantity = shipment.quantity;
    shipment.actualQuantity = actualQuantity;
    shipment.actualSku = actualSku;

    let discrepancyType: "NONE" | "OVER_SHIPMENT" | "UNDER_SHIPMENT" | "WRONG_SKU" = "NONE";
    if (actualSku !== shipment.sku) discrepancyType = "WRONG_SKU";
    else if (actualQuantity > shipment.quantity) discrepancyType = "OVER_SHIPMENT";
    else if (actualQuantity < shipment.quantity) discrepancyType = "UNDER_SHIPMENT";

    if (discrepancyType !== "NONE") {
        shipment.status = ShipmentStatus.DISPUTED;
        shipment.discrepancyType = discrepancyType;
        shipment.statusHistory.push({
            status: ShipmentStatus.DISPUTED,
            timestamp: new Date(),
            notes: `Blind receiving discrepancy detected: ${discrepancyType}`
        });
    } else {
        shipment.status = ShipmentStatus.RECEIVED;
        shipment.statusHistory.push({
            status: ShipmentStatus.RECEIVED,
            timestamp: new Date(),
            notes: "Blind receiving successful: Matches PO"
        });
        await updateStock(shipment.sku, shipment.actualQuantity || shipment.quantity);
        await fulfillPendingOrders(shipment.sku);
    }

    await shipment.save();
    return shipment;
};

const fulfillPendingOrders = async (sku: string) => {
    const pendingOrders = await Shipment.find({
        sku,
        type: ShipmentType.OUTBOUND,
        status: ShipmentStatus.PENDING
    }).sort({ priority: 1, createdAt: 1 });

    for (const order of pendingOrders) {
        const inv = await getInventoryBySku(sku);
        if (!inv) continue;
        const available = inv.onHand - inv.reserved;

        if (available >= order.quantity) {
            order.status = ShipmentStatus.PACKED;
            order.statusHistory.push({
                status: ShipmentStatus.PACKED,
                timestamp: new Date(),
                notes: "Automatically fulfilled from new stock arrivals"
            });
            await order.save();
            await reserveStock(sku, order.quantity);
        }
    }
};
