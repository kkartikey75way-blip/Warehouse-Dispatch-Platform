import { Shipment } from "../models/shipment.model";
import { Parser } from "json2csv";
import { ShipmentStatus } from "../constants/shipmentStatus";
import PDFDocument from "pdfkit";

export const generateDispatchManifestCSV = async (): Promise<string> => {
    const shipments = await Shipment.find({
        status: ShipmentStatus.DISPATCHED
    })
        .populate("assignedDriverId")
        .lean();

    if (shipments.length === 0) return "";

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
        fields: ["trackingId", "zone", "priority", "weight", "volume", "driverId", "dispatchDate"]
    });

    return parser.parse(formatted);
};

export const generateDispatchManifestPDF = async (): Promise<Buffer> => {
    const shipments = await Shipment.find({ status: ShipmentStatus.DISPATCHED })
        .populate("assignedDriverId")
        .lean();

    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        doc.fontSize(20).text("Wareflow Dispatch Manifest", { align: "center" });
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
        doc.moveDown();

        shipments.forEach((s, i) => {
            doc.fontSize(12).text(`${i + 1}. Tracking: ${s.trackingId}`, { underline: true });
            doc.fontSize(10).text(`Zone: ${s.zone} | Priority: ${s.priority} | Driver: ${s.assignedDriverId?._id?.toString() ?? "N/A"}`);
            doc.text(`Weight: ${s.weight}kg | Volume: ${s.volume}m3`);
            doc.moveDown(0.5);
        });

        doc.end();
    });
};

export const generateDeliveryReportCSV = async (): Promise<string> => {
    const { Delivery } = await import("../models/delivery.model");
    const deliveries = await Delivery.find().populate("shipmentId").populate("driverId").lean();

    if (deliveries.length === 0) return "";

    const formatted = deliveries.map((delivery) => ({
        shipmentId: (delivery.shipmentId as { trackingId?: string })?.trackingId ?? "N/A",
        driverId: (delivery.driverId as { _id?: unknown })._id?.toString() ?? "N/A",
        status: delivery.status,
        startedAt: (delivery as { startedAt?: Date }).startedAt ?? "N/A",
        deliveredAt: (delivery as { deliveredAt?: Date }).deliveredAt ?? "N/A",
        exception: (delivery as { exceptionReport?: string }).exceptionReport ?? "N/A"
    }));

    const parser = new Parser({
        fields: ["shipmentId", "driverId", "status", "startedAt", "deliveredAt", "exception"]
    });

    return parser.parse(formatted);
};

export const generateDeliveryReportPDF = async (): Promise<Buffer> => {
    const { Delivery } = await import("../models/delivery.model");
    const deliveries = await Delivery.find().populate("shipmentId").populate("driverId").lean();

    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        doc.fontSize(20).text("Wareflow Delivery Report", { align: "center" });
        doc.moveDown();

        deliveries.forEach((d, i) => {
            const trackingId = (d.shipmentId as { trackingId?: string })?.trackingId ?? "N/A";
            doc.fontSize(12).text(`${i + 1}. Shipment: ${trackingId}`);
            doc.fontSize(10).text(`Status: ${d.status} | Driver: ${(d.driverId as { _id?: unknown })._id?.toString() ?? "N/A"}`);
            doc.text(`Exception: ${(d as { exceptionReport?: string }).exceptionReport ?? "None"}`);
            doc.moveDown(0.5);
        });

        doc.end();
    });
};
