import { Warehouse } from "../models/warehouse.model";
import { Shipment } from "../models/shipment.model";
import { Inventory } from "../models/inventory.model";
import { ShipmentStatus } from "../constants/shipmentStatus";
import { ShipmentType } from "../constants/shipmentType";
import { AppError } from "../utils/appError";

const CAPACITY_FULL_THRESHOLD = 0.95;

export const getAllWarehousesService = async () => {
    const warehouses = await Warehouse.find().lean({ virtuals: true });

    return warehouses.map(wh => ({
        ...wh,
        availableCapacity: wh.totalCapacity - wh.currentOccupancy,
        utilizationPercent: wh.totalCapacity > 0
            ? Math.round((wh.currentOccupancy / wh.totalCapacity) * 100)
            : 0,
        isFull: wh.currentOccupancy >= wh.totalCapacity * CAPACITY_FULL_THRESHOLD
    }));
};

export const findReturnWarehouseService = async (
    originWarehouseCode: string,
    shipmentVolume: number,
    preferredZone?: string
): Promise<{ warehouseCode: string; warehouseName: string; zone: string }> => {
    const warehouses = await Warehouse.find({ isOnline: true }).lean();

    const origin = warehouses.find(wh => wh.code === originWarehouseCode);
    if (origin) {
        const available = origin.totalCapacity - origin.currentOccupancy;
        if (available >= shipmentVolume) {
            return {
                warehouseCode: origin.code,
                warehouseName: origin.name,
                zone: origin.zone
            };
        }
    }

    const candidates = warehouses
        .filter(wh => wh.code !== originWarehouseCode)
        .filter(wh => wh.totalCapacity - wh.currentOccupancy >= shipmentVolume)
        .sort((a, b) => {
            const aZoneBonus = preferredZone && a.zone === preferredZone ? 1000 : 0;
            const bZoneBonus = preferredZone && b.zone === preferredZone ? 1000 : 0;
            const aAvail = a.totalCapacity - a.currentOccupancy + aZoneBonus;
            const bAvail = b.totalCapacity - b.currentOccupancy + bZoneBonus;
            return bAvail - aAvail;
        });

    if (candidates.length === 0) {
        throw new AppError("No warehouse has sufficient capacity to accept this return", 409);
    }

    const winner = candidates[0]!;
    return {
        warehouseCode: winner.code,
        warehouseName: winner.name,
        zone: winner.zone
    };
};

export const heartbeatWarehouseService = async (warehouseCode: string): Promise<void> => {
    await Warehouse.findOneAndUpdate(
        { code: warehouseCode },
        { isOnline: true, lastSeenAt: new Date() }
    );
};

export const markWarehouseOfflineService = async (warehouseCode: string): Promise<void> => {
    await Warehouse.findOneAndUpdate(
        { code: warehouseCode },
        { isOnline: false }
    );
};

export const reconcileSplitBrainConflictService = async (
    sku: string,
    warehouseCodeA: string,
    warehouseCodeB: string,
    orderIdA: string,
    orderIdB: string,
    quantityPerOrder: number
): Promise<{
    winnerOrderId: string;
    loserOrderId: string;
    backordered: boolean;
    message: string;
}> => {
    const invA = await Inventory.findOne({ sku, warehouseCode: warehouseCodeA });
    const invB = await Inventory.findOne({ sku, warehouseCode: warehouseCodeB });

    const shipmentA = await Shipment.findOne({
        trackingId: orderIdA,
        type: ShipmentType.OUTBOUND
    });
    const shipmentB = await Shipment.findOne({
        trackingId: orderIdB,
        type: ShipmentType.OUTBOUND
    });

    if (!shipmentA || !shipmentB) {
        throw new AppError("One or both conflicting orders not found", 404);
    }

    let winnerShipment = shipmentA;
    let loserShipment = shipmentB;

    if (shipmentB.priority === "EXPRESS" && shipmentA.priority !== "EXPRESS") {
        winnerShipment = shipmentB;
        loserShipment = shipmentA;
    } else if (shipmentA.priority === shipmentB.priority) {
        if (shipmentB.createdAt < shipmentA.createdAt) {
            winnerShipment = shipmentB;
            loserShipment = shipmentA;
        }
    }

    loserShipment.status = ShipmentStatus.PENDING;
    loserShipment.statusHistory.push({
        status: ShipmentStatus.PENDING,
        timestamp: new Date(),
        notes: `Backordered due to split-brain stock conflict. Competing order: ${winnerShipment.trackingId}`
    });
    await loserShipment.save();

    if (invA) {
        invA.conflictFlagged = false;
        await invA.save();
    }
    if (invB) {
        invB.conflictFlagged = false;
        await invB.save();
    }

    return {
        winnerOrderId: winnerShipment.trackingId,
        loserOrderId: loserShipment.trackingId,
        backordered: true,
        message: `Order ${winnerShipment.trackingId} will ship. Order ${loserShipment.trackingId} is backordered due to stock conflict.`
    };
};

export const detectSplitBrainConflictsService = async (): Promise<
    Array<{ sku: string; warehouses: string[]; totalReserved: number; totalOnHand: number }>
> => {
    const pipeline = [
        {
            $group: {
                _id: "$sku",
                warehouses: { $push: "$warehouseCode" },
                totalOnHand: { $sum: "$onHand" },
                totalReserved: { $sum: "$reserved" }
            }
        },
        {
            $match: {
                $expr: { $gt: ["$totalReserved", "$totalOnHand"] }
            }
        }
    ];

    const conflicts = await Inventory.aggregate(pipeline);

    return conflicts.map(c => ({
        sku: c._id,
        warehouses: c.warehouses.filter(Boolean),
        totalReserved: c.totalReserved,
        totalOnHand: c.totalOnHand
    }));
};
