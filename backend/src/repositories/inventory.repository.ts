import { Inventory, IInventory } from "../models/inventory.model";

export const getInventoryBySku = async (sku: string): Promise<IInventory | null> => {
    return Inventory.findOne({ sku });
};

export const updateStock = async (sku: string, delta: number): Promise<IInventory> => {
    return Inventory.findOneAndUpdate(
        { sku },
        { $inc: { onHand: delta } },
        { upsert: true, new: true }
    ) as Promise<IInventory>;
};

export const reserveStock = async (sku: string, quantity: number): Promise<IInventory | null> => {
    return Inventory.findOneAndUpdate(
        { sku },
        { $inc: { reserved: quantity } },
        { new: true }
    );
};

export const releaseStock = async (sku: string, quantity: number): Promise<IInventory | null> => {
    return Inventory.findOneAndUpdate(
        { sku },
        { $inc: { reserved: -quantity } },
        { new: true }
    );
};

export const consumeStock = async (sku: string, quantity: number): Promise<IInventory | null> => {
    return Inventory.findOneAndUpdate(
        { sku },
        { $inc: { onHand: -quantity, reserved: -quantity } },
        { new: true }
    );
};
