import { Schema, model, Document, Types } from "mongoose";

export interface IWarehouseBase {
    name: string;
    code: string;
    location: string;
    zone: string;
    totalCapacity: number;
    currentOccupancy: number;
    isOnline: boolean;
    lastSeenAt: Date;
    managers: Types.ObjectId[];
}

export interface IWarehouse extends IWarehouseBase, Document {
    createdAt: Date;
    updatedAt: Date;
}

const warehouseSchema = new Schema<IWarehouse>(
    {
        name: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true,
            unique: true,
            index: true,
            uppercase: true
        },
        location: {
            type: String,
            required: true
        },
        zone: {
            type: String,
            required: true,
            index: true
        },
        totalCapacity: {
            type: Number,
            required: true,
            default: 10000
        },
        currentOccupancy: {
            type: Number,
            default: 0
        },
        isOnline: {
            type: Boolean,
            default: true,
            index: true
        },
        lastSeenAt: {
            type: Date,
            default: () => new Date()
        },
        managers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    { timestamps: true }
);

warehouseSchema.virtual("availableCapacity").get(function () {
    return this.totalCapacity - this.currentOccupancy;
});

warehouseSchema.virtual("utilizationPercent").get(function () {
    return this.totalCapacity > 0
        ? Math.round((this.currentOccupancy / this.totalCapacity) * 100)
        : 0;
});

export const Warehouse = model<IWarehouse>("Warehouse", warehouseSchema);
