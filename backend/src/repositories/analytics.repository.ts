import { Shipment } from "../models/shipment.model";
import { Dispatch } from "../models/dispatch.model";
import { Driver } from "../models/driver.model";
import { ShipmentStatus } from "../constants/shipmentStatus";

export interface IAnalyticsStat {
    totalShipments: number;
    dispatchedToday: number;
    deliveredToday: number;
    activeDrivers: number;
}

export interface IDriverUtilization {
    name: string;
    utilization: number;
}

export interface IRecentActivity {
    type: string;
    description: string;
    time: string;
    status: string;
}

export interface IShipmentTrend {
    name: string;
    value: number;
}

export interface IStatusDistribution {
    _id: string;
    count: number;
}

type IDriverPopulated = {
    userId: {
        name: string;
        _id: string;
    };
    capacity: number;
    currentLoad: number;
};

export const getOnTimeDeliveryRate = async (): Promise<number> => {
    const totalDelivered = await Shipment.countDocuments({
        status: ShipmentStatus.DELIVERED
    });

    const totalExceptions = await Shipment.countDocuments({
        status: ShipmentStatus.RETURNED
    });

    if (totalDelivered + totalExceptions === 0) return 100;

    return (totalDelivered / (totalDelivered + totalExceptions)) * 100;
};

export const getAverageDispatchTime = async (): Promise<number> => {
    const result = await Dispatch.aggregate<{ avgTime: number }>([
        {
            $lookup: {
                from: "shipments",
                localField: "shipmentId",
                foreignField: "_id",
                as: "shipment"
            }
        },
        { $unwind: "$shipment" },
        {
            $project: {
                timeDiff: {
                    $subtract: [
                        "$dispatchTime",
                        "$shipment.createdAt"
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                avgTime: { $avg: "$timeDiff" }
            }
        }
    ]);

    if (result.length === 0) return 0;

    return result[0]?.avgTime || 0;
};

export const getTodayShipmentCount = async (): Promise<number> => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return Shipment.countDocuments({
        createdAt: { $gte: start }
    });
};

export const getDriverUtilization = async (): Promise<number> => {
    const drivers = await Driver.aggregate<{ totalCapacity: number; totalLoad: number }>([
        {
            $group: {
                _id: null,
                totalCapacity: { $sum: "$capacity" },
                totalLoad: { $sum: "$currentLoad" }
            }
        }
    ]);

    if (drivers.length === 0 || !drivers[0]) return 0;

    const { totalCapacity, totalLoad } = drivers[0];

    if (totalCapacity === 0) return 0;

    return (totalLoad / totalCapacity) * 100;
};

export const getDetailedDriverUtilization = async (): Promise<IDriverUtilization[]> => {
    const drivers = await Driver.find({ isAvailable: true }).populate<{ userId: { name: string } }>("userId", "name");

    return drivers.map(d => {
        const populated = d as unknown as IDriverPopulated;
        return {
            name: populated.userId?.name || "Unknown",
            utilization: Math.round((populated.currentLoad / populated.capacity) * 100) || 0
        };
    });
};

export const getRecentActivity = async (): Promise<IRecentActivity[]> => {
    const recentShipments = await Shipment.find().sort({ createdAt: -1 }).limit(5);
    return recentShipments.map(s => ({
        type: "SHIPMENT",
        description: `Shipment ${s.trackingId} created`,
        time: s.createdAt.toLocaleTimeString(),
        status: s.status
    }));
};

export const getPlatformStats = async (): Promise<IAnalyticsStat> => {
    const totalShipments = await Shipment.countDocuments();
    const dispatchedToday = await Shipment.countDocuments({
        status: ShipmentStatus.DISPATCHED,
        updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const deliveredToday = await Shipment.countDocuments({
        status: ShipmentStatus.DELIVERED,
        updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const activeDrivers = await Driver.countDocuments({ isAvailable: true });

    return { totalShipments, dispatchedToday, deliveredToday, activeDrivers };
};

export const getShipmentStatusDistribution = async (): Promise<IStatusDistribution[]> => {
    return Shipment.aggregate<IStatusDistribution>([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);
};

export const getShipmentTrends = async (): Promise<IShipmentTrend[]> => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const trends = await Shipment.aggregate<{ _id: string; count: number }>([
        {
            $match: {
                createdAt: { $gte: last7Days }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const result: IShipmentTrend[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayData = trends.find(t => t._id === dateStr);
        result.push({
            name: d.toLocaleDateString('en-US', { weekday: 'short' }),
            value: dayData ? dayData.count : 0
        });
    }

    return result;
};
