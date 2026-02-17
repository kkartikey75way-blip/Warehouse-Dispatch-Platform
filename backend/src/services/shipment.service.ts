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
    volume: number
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
        volume
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
        IN_TRANSIT: [ShipmentStatus.DELIVERED],
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
