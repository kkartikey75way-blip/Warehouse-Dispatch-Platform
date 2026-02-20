import { Shipment } from "../models/shipment.model";
import { ShipmentStatus } from "../constants/shipmentStatus";
import { eventBus } from "../utils/eventBus";


export const checkSlaEscalations = async (): Promise<number> => {
    const now = new Date();

    const shipmentsToEscalate = await Shipment.find({
        status: { $nin: [ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED] },
        slaDeadline: { $lt: now },
        isEscalated: false
    });

    for (const shipment of shipmentsToEscalate) {
        shipment.isEscalated = true;
        await shipment.save();

        eventBus.emit("sla_escalated", {
            shipmentId: shipment._id.toString(),
            trackingId: shipment.trackingId,
            deadline: shipment.slaDeadline
        });
    }

    return shipmentsToEscalate.length;
};


setInterval(async () => {
    try {
        const count = await checkSlaEscalations();
        if (count > 0) {
            console.log(`[SLA] Escalated ${count} shipments.`);
        }
    } catch (err) {
        console.error("[SLA] Error checking escalations:", err);
    }
}, 5 * 60 * 1000);
