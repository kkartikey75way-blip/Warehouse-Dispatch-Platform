import { ProofOfDelivery, DisputeStatus, IDisputeEvent } from "../models/proofOfDelivery.model";
import { ShipmentEvent, ShipmentEventType } from "../models/shipmentEvent.model";
import { Shipment } from "../models/shipment.model";
import { ShipmentStatus } from "../constants/shipmentStatus";
import { AppError } from "../utils/appError";
import { Types } from "mongoose";

export interface SubmitPODPayload {
    shipmentId: string;
    driverId: string;
    recipientName?: string;
    signatureUrl?: string;
    photoUrl?: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    notes?: string;
}

export const submitPODService = async (payload: SubmitPODPayload) => {
    const {
        shipmentId, driverId, recipientName,
        signatureUrl, photoUrl, latitude, longitude, accuracy, notes
    } = payload;

    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) throw new AppError("Shipment not found", 404);

    if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY) {
        throw new AppError("Shipment is not out for delivery", 400);
    }

    const pod = await ProofOfDelivery.create({
        shipmentId: new Types.ObjectId(shipmentId),
        driverId: new Types.ObjectId(driverId),
        deliveredAt: new Date(),
        ...(recipientName !== undefined && { recipientName }),
        ...(signatureUrl !== undefined && { signatureUrl }),
        ...(photoUrl !== undefined && { photoUrl }),
        gpsCoordinates: {
            latitude,
            longitude,
            capturedAt: new Date(),
            ...(accuracy !== undefined && { accuracy })
        },
        ...(notes !== undefined && { notes }),
        disputeStatus: DisputeStatus.NONE,
        disputeWorkflow: []
    });

    shipment.status = ShipmentStatus.DELIVERED;
    shipment.statusHistory.push({
        status: ShipmentStatus.DELIVERED,
        timestamp: new Date(),
        updatedBy: driverId,
        notes: `POD submitted. Signed by: ${recipientName ?? "N/A"}`
    });
    await shipment.save();

    await ShipmentEvent.create({
        shipmentId: new Types.ObjectId(shipmentId),
        eventType: ShipmentEventType.POD_SUBMITTED,
        timestamp: new Date(),
        actorId: driverId,
        actorRole: "DRIVER",
        payload: {
            recipientName: recipientName ?? null,
            hasSignature: !!signatureUrl,
            hasPhoto: !!photoUrl,
            gps: { latitude, longitude }
        },
        previousStatus: ShipmentStatus.OUT_FOR_DELIVERY,
        newStatus: ShipmentStatus.DELIVERED
    });

    return pod;
};

export const raisePODDisputeService = async (
    shipmentId: string,
    raisedBy: string,
    reason: string
) => {
    const pod = await ProofOfDelivery.findOne({
        shipmentId: new Types.ObjectId(shipmentId)
    });

    if (!pod) throw new AppError("Proof of delivery not found", 404);

    if (pod.disputeStatus !== DisputeStatus.NONE) {
        throw new AppError("A dispute is already active for this delivery", 400);
    }

    const workflowEvent: IDisputeEvent = {
        action: "DISPUTE_RAISED",
        performedBy: raisedBy,
        performedAt: new Date(),
        ...(reason ? { notes: reason } : {})
    };

    pod.disputeStatus = DisputeStatus.OPEN;
    pod.disputeRaisedAt = new Date();
    pod.disputeRaisedBy = raisedBy;
    pod.disputeReason = reason;
    pod.disputeWorkflow.push(workflowEvent);
    await pod.save();

    await ShipmentEvent.create({
        shipmentId: new Types.ObjectId(shipmentId),
        eventType: ShipmentEventType.DISPUTE_RAISED,
        timestamp: new Date(),
        actorId: raisedBy,
        payload: { reason, disputeId: pod._id.toString() }
    });

    return pod;
};

export const advanceDisputeWorkflowService = async (
    shipmentId: string,
    action: string,
    performedBy: string,
    resolution?: DisputeStatus,
    notes?: string
) => {
    const pod = await ProofOfDelivery.findOne({
        shipmentId: new Types.ObjectId(shipmentId)
    });

    if (!pod) throw new AppError("Proof of delivery not found", 404);

    if (pod.disputeStatus === DisputeStatus.NONE) {
        throw new AppError("No active dispute on this delivery", 400);
    }

    const workflowEvent: IDisputeEvent = {
        action,
        performedBy,
        performedAt: new Date(),
        ...(notes !== undefined ? { notes } : {})
    };

    pod.disputeWorkflow.push(workflowEvent);

    if (resolution) {
        pod.disputeStatus = resolution;
        pod.resolvedAt = new Date();
        pod.resolvedBy = performedBy;

        await ShipmentEvent.create({
            shipmentId: new Types.ObjectId(shipmentId),
            eventType: ShipmentEventType.DISPUTE_RESOLVED,
            timestamp: new Date(),
            actorId: performedBy,
            payload: { resolution, notes: notes ?? null }
        });
    } else {
        pod.disputeStatus = DisputeStatus.UNDER_REVIEW;
    }

    await pod.save();
    return pod;
};

export const getPODService = async (shipmentId: string) => {
    const pod = await ProofOfDelivery.findOne({
        shipmentId: new Types.ObjectId(shipmentId)
    })
        .populate("shipmentId")
        .populate("driverId");

    if (!pod) throw new AppError("Proof of delivery not found", 404);

    return {
        podId: pod._id,
        shipmentId: pod.shipmentId,
        deliveredAt: pod.deliveredAt,
        gps: pod.gpsCoordinates,
        hasSignature: !!pod.signatureUrl,
        hasPhoto: !!pod.photoUrl,
        recipientName: pod.recipientName,
        disputeStatus: pod.disputeStatus,
        disputeWorkflow: pod.disputeWorkflow
    };
};
