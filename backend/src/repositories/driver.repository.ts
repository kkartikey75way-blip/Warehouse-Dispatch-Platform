import { Driver, IDriver, IDriverInput } from "../models/driver.model";

export const createDriver = async (
    data: IDriverInput
): Promise<IDriver> => {
    return Driver.create(data);
};

export const findDriverByUserId = async (
    userId: string
): Promise<IDriver | null> => {
    return Driver.findOne({ userId });
};

export const getAvailableDriversByZone = async (
    zone: string
): Promise<IDriver[]> => {
    return Driver.find({
        zone,
        isAvailable: true
    });
};

export const updateDriverAvailability = async (
    id: string,
    isAvailable: boolean
): Promise<IDriver | null> => {
    return Driver.findByIdAndUpdate(
        id,
        { isAvailable },
        { new: true }
    );
};

export const updateDriverLoad = async (
    id: string,
    currentLoad: number
): Promise<IDriver | null> => {
    return Driver.findByIdAndUpdate(
        id,
        { currentLoad },
        { new: true }
    );
};

export const updateDriver = async (
    id: string,
    data: Partial<IDriver>
): Promise<IDriver | null> => {
    return Driver.findByIdAndUpdate(id, data, { new: true });
};

export const reduceDriverLoadAndCapacity = async (
    id: string,
    weight: number
): Promise<IDriver | null> => {
    return Driver.findByIdAndUpdate(
        id,
        {
            $inc: {
                currentLoad: -weight,
                capacity: -weight
            }
        },
        { new: true }
    );
};
export const incrementDriverDrivingTime = async (
    id: string,
    minutes: number
): Promise<IDriver | null> => {
    return Driver.findByIdAndUpdate(
        id,
        { $inc: { cumulativeDrivingTime: minutes, continuousDrivingTime: minutes } },
        { new: true }
    );
};

export const startDriverBreak = async (id: string): Promise<IDriver | null> => {
    return Driver.findByIdAndUpdate(
        id,
        {
            breakStartTime: new Date(),
            isAvailable: false
        },
        { new: true }
    );
};

export const endDriverBreak = async (id: string): Promise<IDriver | null> => {
    return Driver.findByIdAndUpdate(
        id,
        {
            $set: {
                lastBreakTime: new Date(),
                continuousDrivingTime: 0,
                isAvailable: true
            },
            $unset: { breakStartTime: "" }
        },
        { new: true }
    );
};

export const resetContinuousDrivingTime = async (id: string): Promise<IDriver | null> => {
    return Driver.findByIdAndUpdate(
        id,
        { continuousDrivingTime: 0 },
        { new: true }
    );
};

export const deleteDriverById = async (id: string): Promise<IDriver | null> => {
    return Driver.findByIdAndDelete(id);
};
