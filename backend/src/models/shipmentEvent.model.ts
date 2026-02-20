import { Schema, model, Document, Types } from "mongoose";
import { ShipmentStatus } from "../constants/shipmentStatus";

export enum ShipmentEventType {
    STATUS_CHANGE = "STATUS_CHANGE",
    LOCATION_UPDATE = "LOCATION_UPDATE",
    ASSIGNMENT = "ASSIGNMENT",
    DISCREPANCY = "DISCREPANCY",
    DISPUTE_RAISED = "DISPUTE_RAISED",
    DISPUTE_RESOLVED = "DISPUTE_RESOLVED",
    POD_SUBMITTED = "POD_SUBMITTED",
    REQUEUED = "REQUEUED",
}

export interface IShipmentEventBase {
    shipmentId: Types.ObjectId;
    eventType: ShipmentEventType;
    timestamp: Date;
    actorId?: string;
    actorRole?: string;
    payload: Record<string, unknown>;
    previousStatus?: ShipmentStatus;
    newStatus?: ShipmentStatus;
}

export interface IShipmentEvent extends IShipmentEventBase, Document { }

const shipmentEventSchema = new Schema<IShipmentEvent>(
    {
        shipmentId: {
            type: Schema.Types.ObjectId,
            ref: "Shipment",
            required: true,
            index: true
        },
        eventType: {
            type: String,
            enum: Object.values(ShipmentEventType),
            required: true
        },
        timestamp: {
            type: Date,
            required: true,
            default: () => new Date(),
            immutable: true
        },
        actorId: { type: String },
        actorRole: { type: String },
        payload: {
            type: Schema.Types.Mixed,
            required: true,
            default: {}
        },
        previousStatus: {
            type: String,
            enum: [...Object.values(ShipmentStatus), null, undefined],
        },
        newStatus: {
            type: String,
            enum: [...Object.values(ShipmentStatus), null, undefined],
        }
    },
    {
        timestamps: false,
    }
);

shipmentEventSchema.index({ shipmentId: 1, timestamp: 1 });
shipmentEventSchema.index({ shipmentId: 1, eventType: 1, timestamp: 1 });

export const ShipmentEvent = model<IShipmentEvent>("ShipmentEvent", shipmentEventSchema);
