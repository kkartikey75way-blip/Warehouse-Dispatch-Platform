import { Types } from "mongoose";
import { getAvailableDriversByZone, updateDriverLoad, reduceDriverLoadAndCapacity } from "../repositories/driver.repository";
import { bulkMarkAsDispatched, findShipmentById, getPendingOutboundShipments } from "../repositories/shipment.repository";
import { createDispatchRecords, getDispatches } from "../repositories/dispatch.repository";
import { AppError } from "../utils/appError";
import { ShipmentStatus } from "../constants/shipmentStatus";
import { eventBus } from "../utils/eventBus";
import { updateDispatchStatus } from "../repositories/dispatch.repository";
import { deleteCache } from "../utils/cache";

export const getDispatchesService = async () => {
    const dispatches = await getDispatches();

    return dispatches.filter(d =>
        d.status !== ShipmentStatus.DELIVERED &&
        d.status !== ShipmentStatus.RETURNED
    );
};

eventBus.on("delivery_completed", async ({ driverId, shipmentId }) => {
    await updateDispatchStatus(shipmentId, ShipmentStatus.DELIVERED);

    const shipment = await findShipmentById(shipmentId);
    if (shipment && driverId) {
        await reduceDriverLoadAndCapacity(driverId, shipment.weight);
    }

    // Clear analytics cache to show updated capacity immediately
    await deleteCache("kpi_dashboard");
});

eventBus.on("delivery_exception", async ({ shipmentId }) => {
    await updateDispatchStatus(shipmentId, ShipmentStatus.RETURNED);
});

export const autoAssignDispatchService = async (): Promise<void> => {
    const shipments = await getPendingOutboundShipments();

    if (shipments.length === 0) {
        throw new AppError("No shipments ready for dispatch", 400);
    }


    const zoneMap = new Map<string, typeof shipments>();

    for (const shipment of shipments) {
        const zoneShipments = zoneMap.get(shipment.zone) ?? [];
        zoneShipments.push(shipment);
        zoneMap.set(shipment.zone, zoneShipments);
    }

    for (const [zone, zoneShipments] of zoneMap) {
        let remainingShipments = [...zoneShipments];
        const drivers = await getAvailableDriversByZone(zone);

        if (drivers.length === 0) continue;

        for (const driver of drivers) {
            if (remainingShipments.length === 0) break;

            const availableCapacity = driver.capacity - driver.currentLoad;
            if (availableCapacity <= 0) continue;

            const assignedShipments: typeof shipments = [];
            let usedCapacity = 0;

            for (const shipment of remainingShipments) {
                if (usedCapacity + shipment.weight <= availableCapacity) {
                    assignedShipments.push(shipment);
                    usedCapacity += shipment.weight;
                }
            }

            if (assignedShipments.length === 0) continue;

            const assignedIds = assignedShipments.map(s => s._id as Types.ObjectId);

            await bulkMarkAsDispatched(
                assignedIds,
                driver._id as Types.ObjectId
            );

            await createDispatchRecords(
                assignedIds.map((id) => ({
                    shipmentId: id,
                    driverId: driver._id as Types.ObjectId
                }))
            );


            await updateDriverLoad(
                driver._id.toString(),
                driver.currentLoad + usedCapacity
            );


            remainingShipments = remainingShipments.filter(
                s => !assignedIds.map(id => id.toString()).includes(s._id.toString())
            );

            eventBus.emit("dispatch_assigned", {
                driverId: driver._id.toString(),
                shipmentCount: assignedIds.length
            });
        }
    }
};

export const assignBatchToDriverService = async (
    batchId: string,
    driverId: string
): Promise<void> => {
    const { getShipmentsByBatchId } = await import("../repositories/shipment.repository");
    const { Driver } = await import("../models/driver.model");

    const shipments = await getShipmentsByBatchId(batchId);

    if (!shipments || shipments.length === 0) {
        throw new AppError("No shipments found for this batch", 404);
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
        throw new AppError("Driver not found", 404);
    }

    const totalWeight = shipments.reduce((sum, s) => sum + s.weight, 0);

    if (driver.currentLoad + totalWeight > driver.capacity) {
        throw new AppError("Driver capacity exceeded", 400);
    }

    const shipmentIds = shipments.map(s => s._id as Types.ObjectId);

    await bulkMarkAsDispatched(
        shipmentIds,
        driver._id as Types.ObjectId
    );

    await createDispatchRecords(
        shipmentIds.map((id) => ({
            shipmentId: id,
            driverId: driver._id as Types.ObjectId
        }))
    );


    await updateDriverLoad(
        driver._id.toString(),
        driver.currentLoad + totalWeight
    );

    eventBus.emit("dispatch_assigned", {
        driverId: driver._id.toString(),
        shipmentCount: shipments.length
    });
};
