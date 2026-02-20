import { Schema, model, Document, Types } from "mongoose";

export enum DisputeStatus {
    NONE = "NONE",
    OPEN = "OPEN",
    UNDER_REVIEW = "UNDER_REVIEW",
    RESOLVED_IN_CUSTOMER_FAVOR = "RESOLVED_IN_CUSTOMER_FAVOR",
    RESOLVED_IN_WAREHOUSE_FAVOR = "RESOLVED_IN_WAREHOUSE_FAVOR",
    ESCALATED = "ESCALATED"
}

export interface IGpsCoordinates {
    latitude: number;
    longitude: number;
    accuracy?: number;
    capturedAt: Date;
}

export interface IDisputeEvent {
    action: string;
    performedBy: string;
    performedAt: Date;
    notes?: string;
}

export interface IProofOfDeliveryBase {
    shipmentId: Types.ObjectId;
    driverId: Types.ObjectId;
    deliveredAt: Date;
    recipientName?: string;
    signatureUrl?: string;
    photoUrl?: string;
    gpsCoordinates: IGpsCoordinates;
    disputeStatus: DisputeStatus;
    disputeRaisedAt?: Date;
    disputeRaisedBy?: string;
    disputeReason?: string;
    disputeWorkflow: IDisputeEvent[];
    resolvedAt?: Date;
    resolvedBy?: string;
    evidenceBundleUrl?: string;
    notes?: string;
}

export interface IProofOfDelivery extends IProofOfDeliveryBase, Document {
    createdAt: Date;
    updatedAt: Date;
}

const gpsSchema = new Schema<IGpsCoordinates>(
    {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        accuracy: { type: Number },
        capturedAt: { type: Date, required: true, default: () => new Date() }
    },
    { _id: false }
);

const disputeEventSchema = new Schema<IDisputeEvent>(
    {
        action: { type: String, required: true },
        performedBy: { type: String, required: true },
        performedAt: { type: Date, required: true, default: () => new Date() },
        notes: { type: String }
    },
    { _id: false }
);

const proofOfDeliverySchema = new Schema<IProofOfDelivery>(
    {
        shipmentId: {
            type: Schema.Types.ObjectId,
            ref: "Shipment",
            required: true,
            unique: true,
            index: true
        },
        driverId: {
            type: Schema.Types.ObjectId,
            ref: "Driver",
            required: true
        },
        deliveredAt: { type: Date, required: true, default: () => new Date() },
        recipientName: { type: String },
        signatureUrl: { type: String },
        photoUrl: { type: String },
        gpsCoordinates: { type: gpsSchema, required: true },
        disputeStatus: {
            type: String,
            enum: Object.values(DisputeStatus),
            default: DisputeStatus.NONE,
            index: true
        },
        disputeRaisedAt: { type: Date },
        disputeRaisedBy: { type: String },
        disputeReason: { type: String },
        disputeWorkflow: { type: [disputeEventSchema], default: [] },
        resolvedAt: { type: Date },
        resolvedBy: { type: String },
        evidenceBundleUrl: { type: String },
        notes: { type: String }
    },
    { timestamps: true }
);

export const ProofOfDelivery = model<IProofOfDelivery>("ProofOfDelivery", proofOfDeliverySchema);
