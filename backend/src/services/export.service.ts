import { Shipment } from "../models/shipment.model";
import { Parser } from "json2csv";
import { ShipmentStatus } from "../constants/shipmentStatus";

export const generateDispatchManifestCSV = async (): Promise<string> => {
    const shipments = await Shipment.find({
        status: ShipmentStatus.DISPATCHED
    })
        .populate("assignedDriverId")
        .lean();

    if (shipments.length === 0) {
        return "";
    }

    const formatted = shipments.map((shipment) => ({
        trackingId: shipment.trackingId,
        zone: shipment.zone,
        priority: shipment.priority,
        weight: shipment.weight,
        volume: shipment.volume,
        driverId: shipment.assignedDriverId?._id?.toString() ?? "N/A",
        dispatchDate: shipment.updatedAt
    }));

    const parser = new Parser({
        fields: [
            "trackingId",
            "zone",
            "priority",
            "weight",
            "volume",
            "driverId",
            "dispatchDate"
        ]
    });

    return parser.parse(formatted);
};

export const generateDeliveryReportCSV = async (): Promise<string> => {
    const { Delivery } = await import("../models/delivery.model");

    const deliveries = await Delivery.find()
        .populate("shipmentId")
        .populate("driverId")
        .lean();

    if (deliveries.length === 0) {
        return "";
    }

    const formatted = deliveries.map((delivery) => ({
        shipmentId: (delivery.shipmentId as { trackingId?: string })?.trackingId ?? "N/A",
        driverId: (delivery.driverId as { _id?: unknown })._id?.toString() ?? "N/A",
        status: delivery.status,
        startedAt: (delivery as { startedAt?: Date }).startedAt ?? "N/A",
        deliveredAt: (delivery as { deliveredAt?: Date }).deliveredAt ?? "N/A",
        exception: (delivery as { exceptionReport?: string }).exceptionReport ?? "N/A"
    }));

    const parser = new Parser({
        fields: [
            "shipmentId",
            "driverId",
            "status",
            "startedAt",
            "deliveredAt",
            "exception"
        ]
    });

    return parser.parse(formatted);
};
