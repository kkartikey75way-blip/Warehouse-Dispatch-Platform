import { Types } from "mongoose";
import { getAvailableDriversByZone, updateDriverLoad, reduceDriverLoadAndCapacity, incrementDriverDrivingTime } from "../repositories/driver.repository";
import { consumeStock } from "../repositories/inventory.repository";
import { bulkMarkAsDispatched, findShipmentById, getPendingOutboundShipments } from "../repositories/shipment.repository";
import { createDispatchRecords, getDispatches, updateDispatchStatus } from "../repositories/dispatch.repository";
import { AppError } from "../utils/appError";
import { ShipmentStatus } from "../constants/shipmentStatus";
import { ShipmentPriority } from "../constants/priorities";
import { eventBus } from "../utils/eventBus";
import { deleteCache } from "../utils/cache";
import { IDriver } from "../models/driver.model";
import { IShipment, StatusHistoryEntry } from "../models/shipment.model";
import { ShipmentEvent, ShipmentEventType, IShipmentEventBase } from "../models/shipmentEvent.model";

const MAX_DAILY_DRIVE_MINUTES = 600;
const MAX_CONTINUOUS_DRIVE_MINUTES = 300;
const SPEED_KMH = 50;
const SERVICE_TIME_MINUTES = 15;
const DRIVER_REGULATION_BUFFER_MINUTES = 15;

export interface RegulationCheckResult {
    allowed: boolean;
    reason?: string;
}

export const checkDriverRegulations = (driver: IDriver, estimatedDeliveryMins: number): RegulationCheckResult => {
    const projectedCumulative = driver.cumulativeDrivingTime + estimatedDeliveryMins;

    if (projectedCumulative > MAX_DAILY_DRIVE_MINUTES - DRIVER_REGULATION_BUFFER_MINUTES) {
        return {
            allowed: false,
            reason: `Assignment would cause driver to exceed daily limit of 10 hours (current: ${Math.round(driver.cumulativeDrivingTime)}min, estimated: ${estimatedDeliveryMins}min)`
        };
    }

    if (driver.continuousDrivingTime + estimatedDeliveryMins > MAX_CONTINUOUS_DRIVE_MINUTES - DRIVER_REGULATION_BUFFER_MINUTES) {
        return {
            allowed: false,
            reason: `Assignment would violate mandatory 30-minute break rule (${Math.round(driver.continuousDrivingTime)}min continuous driving)`
        };
    }

    return { allowed: true };
};

const estimateDeliveryMinutes = (shipments: IShipment[]): number => {
    return shipments.length * (SERVICE_TIME_MINUTES + 10);
};

const withinTimeWindow = (shipment: IShipment, travelMinutes: number = 0): boolean => {
    const s = shipment as IShipment & { timeWindowStart?: Date; timeWindowEnd?: Date; };
    if (!s.timeWindowStart || !s.timeWindowEnd) return true;

    
    const projectedArrival = new Date(Date.now() + travelMinutes * 60 * 1000);

    
    return projectedArrival >= s.timeWindowStart && projectedArrival <= s.timeWindowEnd;
};

export interface OptimizationResult {
    assignedCount: number;
    unassigned: string[];
    score: number;
    details: {
        capacityUtilization: number;
        priorityCoverage: number;
        regulationCompliance: number;
        timeWindowCompliance: number;
    };
}

const calculateOptimizationScore = (
    totalShipments: number,
    assigned: number,
    expressAssigned: number,
    totalExpress: number,
    capacitySum: number,
    maxCapacitySum: number
): number => {
    const assignmentRate = totalShipments > 0 ? (assigned / totalShipments) * 40 : 0;
    const priorityCoverage = totalExpress > 0 ? (expressAssigned / totalExpress) * 35 : 35;
    const capacityEfficiency = maxCapacitySum > 0 ? (capacitySum / maxCapacitySum) * 25 : 25;
    return Math.min(100, Math.round(assignmentRate + priorityCoverage + capacityEfficiency));
};

eventBus.on("delivery_completed", async ({ driverId, shipmentId }) => {
    await updateDispatchStatus(shipmentId, ShipmentStatus.DELIVERED);
    const shipment = await findShipmentById(shipmentId);

    if (shipment && driverId) {
        await reduceDriverLoadAndCapacity(driverId, shipment.weight);
        const deliveredEntry = shipment.statusHistory.find(h => h.status === ShipmentStatus.DELIVERED);
        const inTransitEntry = shipment.statusHistory.find(h => h.status === ShipmentStatus.IN_TRANSIT);

        if (deliveredEntry && inTransitEntry) {
            const drivingTimeMs = deliveredEntry.timestamp.getTime() - inTransitEntry.timestamp.getTime();
            const drivingMinutes = Math.round(drivingTimeMs / (1000 * 60));
            if (drivingMinutes > 0) await incrementDriverDrivingTime(driverId, drivingMinutes);
        }

        
        await consumeStock(shipment.sku, shipment.quantity);
    }
    await deleteCache("kpi_dashboard");
});

eventBus.on("delivery_exception", async ({ shipmentId }) => {
    await updateDispatchStatus(shipmentId, ShipmentStatus.RETURNED);
});

export const getDispatchesService = async () => {
    const dispatches = await getDispatches();
    return dispatches.filter(d => d.status !== ShipmentStatus.DELIVERED && d.status !== ShipmentStatus.RETURNED);
};

export const autoAssignDispatchService = async (): Promise<OptimizationResult> => {
    const allShipments = await getPendingOutboundShipments();
    if (allShipments.length === 0) throw new AppError("No shipments ready for dispatch", 400);

    const priorityWeight: Record<string, number> = {
        [ShipmentPriority.EXPRESS]: 0,
        [ShipmentPriority.STANDARD]: 1,
        [ShipmentPriority.BULK]: 2
    };

    const shipments = [...allShipments].sort((a, b) => {
        const pa = priorityWeight[a.priority] ?? 99;
        const pb = priorityWeight[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const zoneMap = new Map<string, typeof shipments>();
    for (const shipment of shipments) {
        const zoneShipments = zoneMap.get(shipment.zone) ?? [];
        zoneShipments.push(shipment);
        zoneMap.set(shipment.zone, zoneShipments);
    }

    const unassigned: string[] = [];
    let totalAssigned = 0;
    let totalExpressAssigned = 0;
    let totalCapacityUsed = 0;
    let totalMaxCapacity = 0;
    const totalExpress = shipments.filter(s => s.priority === ShipmentPriority.EXPRESS).length;

    for (const [zone, zoneShipments] of zoneMap) {
        let remainingShipments = [...zoneShipments];
        const drivers = await getAvailableDriversByZone(zone);

        if (drivers.length === 0) {
            unassigned.push(...remainingShipments.map(s => s.trackingId));
            continue;
        }

        const sortedDrivers = [...drivers].sort((a, b) => b.capacity - b.currentLoad - (a.capacity - a.currentLoad));

        for (const driver of sortedDrivers) {
            if (remainingShipments.length === 0) break;

            const availableWeightCapacity = driver.capacity - driver.currentLoad;
            const availableVolumeCapacity = (driver.volumeCapacity ?? 20) - (driver.currentVolume ?? 0);

            if (availableWeightCapacity <= 0) continue;
            totalMaxCapacity += driver.capacity;

            const assignedShipments: typeof shipments = [];
            let usedWeight = 0;
            let usedVolume = 0;

            for (const shipment of remainingShipments) {
                const candidateWeight = usedWeight + shipment.weight;
                const candidateVolume = usedVolume + shipment.volume;

                if (candidateWeight <= availableWeightCapacity && candidateVolume <= availableVolumeCapacity) {
                    const estimatedMins = estimateDeliveryMinutes([...assignedShipments, shipment]);

                    
                    if (!withinTimeWindow(shipment, estimatedMins)) continue;

                    const regCheck = checkDriverRegulations(driver, estimatedMins);
                    if (!regCheck.allowed) continue;

                    assignedShipments.push(shipment);
                    usedWeight += shipment.weight;
                    usedVolume += shipment.volume;
                }
            }

            if (assignedShipments.length === 0) continue;

            const assignedIds = assignedShipments.map(s => s._id as Types.ObjectId);
            await bulkMarkAsDispatched(assignedIds, driver._id as Types.ObjectId);
            await createDispatchRecords(assignedIds.map(id => ({ shipmentId: id, driverId: driver._id as Types.ObjectId })));
            await updateDriverLoad(driver._id.toString(), driver.currentLoad + usedWeight);

            totalAssigned += assignedShipments.length;
            totalCapacityUsed += usedWeight;
            totalExpressAssigned += assignedShipments.filter(s => s.priority === ShipmentPriority.EXPRESS).length;

            remainingShipments = remainingShipments.filter(s => !assignedIds.map(id => id.toString()).includes(s._id.toString()));

            for (const s of assignedShipments) {
                await ShipmentEvent.create({
                    shipmentId: s._id as Types.ObjectId,
                    eventType: ShipmentEventType.STATUS_CHANGE,
                    timestamp: new Date(),
                    previousStatus: ShipmentStatus.PACKED,
                    newStatus: ShipmentStatus.DISPATCHED,
                    payload: { driverId: driver._id.toString(), method: "auto-assign" }
                });
            }

            eventBus.emit("dispatch_assigned", { driverId: driver._id.toString(), shipmentCount: assignedIds.length });
        }
        unassigned.push(...remainingShipments.map(s => s.trackingId));
    }

    const score = calculateOptimizationScore(shipments.length, totalAssigned, totalExpressAssigned, totalExpress, totalCapacityUsed, totalMaxCapacity);
    const capacityUtilization = totalMaxCapacity > 0 ? Math.round((totalCapacityUsed / totalMaxCapacity) * 100) : 0;
    const priorityCoverage = totalExpress > 0 ? Math.round((totalExpressAssigned / totalExpress) * 100) : 100;

    return {
        assignedCount: totalAssigned,
        unassigned,
        score,
        details: { capacityUtilization, priorityCoverage, regulationCompliance: 100, timeWindowCompliance: 100 }
    };
};

export const assignBatchToDriverService = async (batchId: string, driverId: string): Promise<void> => {
    const { getShipmentsByBatchId } = await import("../repositories/shipment.repository");
    const { Driver } = await import("../models/driver.model");

    const shipments = await getShipmentsByBatchId(batchId);
    if (!shipments || shipments.length === 0) throw new AppError("No shipments found for this batch", 404);

    const driver = await Driver.findById(driverId);
    if (!driver) throw new AppError("Driver not found", 404);

    const estimatedMins = estimateDeliveryMinutes(shipments);
    const regCheck = checkDriverRegulations(driver, estimatedMins);
    if (!regCheck.allowed) throw new AppError(regCheck.reason!, 400);

    const totalWeight = shipments.reduce((sum, s) => sum + s.weight, 0);
    const totalVolume = shipments.reduce((sum, s) => sum + s.volume, 0);

    if (driver.currentLoad + totalWeight > driver.capacity) {
        throw new AppError(`Driver weight capacity exceeded (capacity: ${driver.capacity}kg, current: ${driver.currentLoad}kg, needed: ${totalWeight}kg)`, 400);
    }

    const driverVolumeCap = driver.volumeCapacity ?? 20;
    const driverCurrentVol = driver.currentVolume ?? 0;
    if (driverCurrentVol + totalVolume > driverVolumeCap) {
        throw new AppError(`Driver volume capacity exceeded (capacity: ${driverVolumeCap}m³, current: ${driverCurrentVol}m³, needed: ${totalVolume}m³)`, 400);
    }

    if (shipments.filter(s => !withinTimeWindow(s)).length > 0) {
        throw new AppError("Some shipments have incompatible delivery time windows", 400);
    }

    const shipmentIds = shipments.map(s => s._id as Types.ObjectId);
    await bulkMarkAsDispatched(shipmentIds, driver._id as Types.ObjectId);
    await createDispatchRecords(shipmentIds.map(id => ({ shipmentId: id, driverId: driver._id as Types.ObjectId })));
    await updateDriverLoad(driver._id.toString(), driver.currentLoad + totalWeight);

    for (const s of shipments) {
        await ShipmentEvent.create({
            shipmentId: s._id as Types.ObjectId,
            eventType: ShipmentEventType.STATUS_CHANGE,
            timestamp: new Date(),
            previousStatus: s.status,
            newStatus: ShipmentStatus.DISPATCHED,
            payload: { driverId: driver._id.toString(), method: "batch-assign" }
        });
    }

    eventBus.emit("dispatch_assigned", { driverId: driver._id.toString(), shipmentCount: shipments.length });
};

export const requeueFailedDeliveryService = async (shipmentId: string, reason: string, actorId?: string): Promise<void> => {
    const shipment = await findShipmentById(shipmentId);
    if (!shipment) throw new AppError("Shipment not found", 404);

    if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY && shipment.status !== ShipmentStatus.DISPATCHED && shipment.status !== ShipmentStatus.IN_TRANSIT) {
        throw new AppError("Only in-transit/out-for-delivery shipments can be re-queued", 400);
    }

    if (shipment.priority === "STANDARD") (shipment as unknown as { priority: string }).priority = "EXPRESS";

    if (shipment.assignedDriverId) {
        await reduceDriverLoadAndCapacity(shipment.assignedDriverId.toString(), shipment.weight);
        shipment.set('assignedDriverId', undefined);
        shipment.acceptedByDriver = false;
    }

    shipment.status = ShipmentStatus.PACKED;
    const histEntry: StatusHistoryEntry = { status: ShipmentStatus.PACKED, timestamp: new Date(), notes: `Re-queued after delivery failure: ${reason}` };
    if (actorId) histEntry.updatedBy = actorId;
    shipment.statusHistory.push(histEntry);
    await shipment.save();

    const requeueEventDoc: Partial<IShipmentEventBase> = {
        shipmentId: shipment._id as Types.ObjectId,
        eventType: ShipmentEventType.REQUEUED,
        timestamp: new Date(),
        payload: { reason, previousStatus: ShipmentStatus.OUT_FOR_DELIVERY },
        previousStatus: ShipmentStatus.OUT_FOR_DELIVERY,
        newStatus: ShipmentStatus.PACKED
    };
    if (actorId) requeueEventDoc.actorId = actorId;
    await ShipmentEvent.create(requeueEventDoc);
};
