import { Schema, model, Document } from "mongoose";

export interface IInventory extends Document {
    sku: string;
    onHand: number;
    reserved: number;
    createdAt: Date;
    updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
    {
        sku: {
            type: String,
            required: true,
            unique: true,
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
        }
    },
    { timestamps: true }
);

export const Inventory = model<IInventory>("Inventory", inventorySchema);
