import { Dispatch, IDispatch } from "../models/dispatch.model";
import { Types } from "mongoose";
import { ShipmentStatus } from "../constants/shipmentStatus";

export const createDispatchRecords = async (
    records: {
        shipmentId: Types.ObjectId;
        driverId: Types.ObjectId;
    }[]
): Promise<void> => {
    const bulk = records.map((record) => ({
        insertOne: {
            document: {
                shipmentId: record.shipmentId,
                driverId: record.driverId,
                dispatchTime: new Date(),
                status: ShipmentStatus.DISPATCHED
            }
        }
    }));

    await Dispatch.bulkWrite(bulk);
};

export const getDispatches = async (): Promise<IDispatch[]> => {
    return Dispatch.find()
        .populate("shipmentId")
        .populate({
            path: "driverId",
            populate: { path: "userId" }
        })
        .sort({ dispatchTime: -1 });
};

export const updateDispatchStatus = async (
    shipmentId: string,
    status: ShipmentStatus
): Promise<void> => {
    await Dispatch.findOneAndUpdate(
        { shipmentId: new Types.ObjectId(shipmentId) },
        { status },
        { sort: { dispatchTime: -1 } }
    );
};

