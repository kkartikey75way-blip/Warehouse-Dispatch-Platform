import { Schema, model, Document, Types } from "mongoose";

export interface IInventory extends Document {
    sku: string;
    warehouseId?: Types.ObjectId;
    warehouseCode?: string;
    onHand: number;
    reserved: number;
    conflictFlagged?: boolean;
    conflictOrderId?: string;
    conflictDetectedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
    {
        sku: {
            type: String,
            required: true,
            index: true
        },
        warehouseId: {
            type: Schema.Types.ObjectId,
            ref: "Warehouse",
            index: true
        },
        warehouseCode: {
            type: String,
            index: true
        },
        onHand: {
            type: Number,
            required: true,
            default: 0
        },
        reserved: {
            type: Number,
            required: true,
            default: 0
        },
        conflictFlagged: {
            type: Boolean,
            default: false,
            index: true
        },
        conflictOrderId: {
            type: String
        },
        conflictDetectedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

export const Inventory = model<IInventory>("Inventory", inventorySchema);
