import { Schema, model, Document, Types } from "mongoose";

export enum DriverShift {
    MORNING = "MORNING",
    AFTERNOON = "AFTERNOON",
    NIGHT = "NIGHT"
}

export interface IDriverInput {
    userId: Types.ObjectId;
    zone: string;
    capacity: number;
    currentLoad: number;
    isAvailable: boolean;
    shift: DriverShift;
    shiftStart: Date;
    shiftEnd: Date;
    cumulativeDrivingTime: number; 
    lastBreakTime?: Date;
}

export interface IDriver extends IDriverInput, Document {
    createdAt: Date;
    updatedAt: Date;

}

const driverSchema = new Schema<IDriver>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },
        zone: {
            type: String,
            required: true,
            index: true
        },
        capacity: {
            type: Number,
            required: true
        },
        currentLoad: {
            type: Number,
            default: 0
        },
        isAvailable: {
            type: Boolean,
            default: true,
            index: true
        },
        shift: {
            type: String,
            enum: Object.values(DriverShift),
            default: DriverShift.MORNING,
            index: true
        },
        shiftStart: {
            type: Date,
            required: true
        },
        shiftEnd: {
            type: Date,
            required: true
        },
        cumulativeDrivingTime: {
            type: Number,
            default: 0
        },
        lastBreakTime: {
            type: Date
        }
    },
    { timestamps: true }
);

driverSchema.index({ zone: 1, isAvailable: 1 });

export const Driver = model<IDriver>("Driver", driverSchema);
