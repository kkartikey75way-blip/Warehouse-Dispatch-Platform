import { Schema, model, Document, Types } from "mongoose";
import { ShipmentStatus } from "../constants/shipmentStatus";
import { ShipmentType } from "../constants/shipmentType";
import { ShipmentPriority } from "../constants/priorities";

export interface LocationPoint {
    latitude: number;
    longitude: number;
    timestamp: Date;
    accuracy?: number;
}

export interface StatusHistoryEntry {
    status: ShipmentStatus;
    timestamp: Date;
    updatedBy?: string;
    notes?: string;
}

export interface IShipmentBase {
    trackingId: string;
    sku: string;
    quantity: number;
    type: ShipmentType;
    priority: ShipmentPriority;
    zone: string;
    origin: string;
    destination: string;
    weight: number;
    volume: number;
    status: ShipmentStatus;
    assignedDriverId?: Types.ObjectId;
    acceptedByDriver?: boolean;
    acceptedAt?: Date;
    batchId?: string;
    currentLocation?: LocationPoint;
    locationHistory: LocationPoint[];
    statusHistory: StatusHistoryEntry[];
    estimatedDeliveryTime?: Date;
    slaTier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
    slaDeadline?: Date;
    isEscalated?: boolean;
}

export interface IShipment extends IShipmentBase, Document {
    createdAt: Date;
    updatedAt: Date;
}

const shipmentSchema = new Schema<IShipment>(
    {
        trackingId: {
            type: String,
            required: true,
            unique: true
        },
        sku: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        type: {
            type: String,
            enum: Object.values(ShipmentType),
            required: true
        },
        priority: {
            type: String,
            enum: Object.values(ShipmentPriority),
            required: true,
            index: true
        },
        zone: {
            type: String,
            required: true
        },
        origin: {
            type: String,
            required: true
        },
        destination: {
            type: String,
            required: true
        },
        weight: {
            type: Number,
            required: true
        },
        volume: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: Object.values(ShipmentStatus),
            default: ShipmentStatus.PACKED
        },
        assignedDriverId: {
            type: Schema.Types.ObjectId,
            ref: "Driver"
        },
        acceptedByDriver: {
            type: Boolean,
            default: false
        },
        acceptedAt: {
            type: Date
        },
        batchId: {
            type: String,
            index: true
        },
        currentLocation: {
            latitude: { type: Number },
            longitude: { type: Number },
            timestamp: { type: Date },
            accuracy: { type: Number }
        },
        locationHistory: {
            type: [{
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true },
                timestamp: { type: Date, required: true },
                accuracy: { type: Number }
            }],
            default: []
        },
        statusHistory: {
            type: [{
                status: {
                    type: String,
                    enum: Object.values(ShipmentStatus),
                    required: true
                },
                timestamp: { type: Date, required: true },
                updatedBy: { type: String },
                notes: { type: String }
            }],
            default: []
        },
        estimatedDeliveryTime: {
            type: Date
        },
        slaTier: {
            type: String,
            enum: ["BRONZE", "SILVER", "GOLD", "PLATINUM"],
            default: "BRONZE"
        },
        slaDeadline: {
            type: Date
        },
        isEscalated: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);


shipmentSchema.index({ status: 1, priority: -1, createdAt: -1 });
shipmentSchema.index({ zone: 1, status: 1, priority: -1 });
shipmentSchema.index({ assignedDriverId: 1, status: 1 });
shipmentSchema.index({ isEscalated: 1 });

export const Shipment = model<IShipment>("Shipment", shipmentSchema);
