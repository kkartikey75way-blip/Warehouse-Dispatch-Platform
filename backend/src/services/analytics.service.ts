import { Shipment } from "../models/shipment.model";
import { Driver } from "../models/driver.model";
import { ShipmentStatus } from "../constants/shipmentStatus";
import { ShipmentType } from "../constants/shipmentType";
import {
    getOnTimeDeliveryRate,
    getAverageDispatchTime,
    getTodayShipmentCount,
    getDetailedDriverUtilization,
    getRecentActivity,
    getPlatformStats,
    getShipmentStatusDistribution,
    getShipmentTrends
} from "../repositories/analytics.repository";
import { getCache, setCache } from "../utils/cache";

interface DriverUtilization {
    name: string;
    utilization: number;
}

interface RecentActivity {
    description: string;
    time: string;
    status: string;
}

interface KpiDashboard {
    onTimeRate: number;
    avgDispatchTime: number;
    todayShipments: number;
    driverUtilization: DriverUtilization[];
    recentActivity: RecentActivity[];
    totalShipments: number;
    dispatchedToday: number;
    deliveredToday: number;
    activeDrivers: number;
    shipmentsByStatus: Array<{ _id: string; count: number }>;
    trends: Array<{ name: string; value: number }>;
    performanceScore: number;
    causalAnalysis?: CausalWaterfall;
}

export interface WaterfallStep {
    category: string;
    impact: number;
    description: string;
    shipmentCount: number;
}

export interface CausalWaterfall {
    baselineOnTimeRate: number;
    currentOnTimeRate: number;
    totalDelta: number;
    steps: WaterfallStep[];
    primaryCause: string;
}

export const analyzeCausalWaterfall = async (windowHours: number = 24): Promise<CausalWaterfall> => {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowHours * 60 * 60 * 1000);
    const prevWindowStart = new Date(windowStart.getTime() - windowHours * 60 * 60 * 1000);

    const [currentRate, baselineShipments, currentShipments] = await Promise.all([
        getOnTimeDeliveryRate(),
        Shipment.countDocuments({
            createdAt: { $gte: prevWindowStart, $lt: windowStart },
            type: ShipmentType.OUTBOUND
        }),
        Shipment.countDocuments({
            createdAt: { $gte: windowStart },
            type: ShipmentType.OUTBOUND
        })
    ]);

    const baselineRate = Math.min(100, currentRate + 5);
    const totalDelta = currentRate - baselineRate;
    const steps: WaterfallStep[] = [];

    const unavailableDrivers = await Driver.countDocuments({ isAvailable: false });
    const totalDrivers = await Driver.countDocuments({});
    const driverShortageRatio = totalDrivers > 0 ? unavailableDrivers / totalDrivers : 0;
    const driverImpact = Math.round(-driverShortageRatio * 20 * 10) / 10;

    if (driverShortageRatio > 0.2) {
        steps.push({
            category: "Driver Shortage",
            impact: driverImpact,
            description: `${unavailableDrivers}/${totalDrivers} drivers unavailable`,
            shipmentCount: await Shipment.countDocuments({
                status: ShipmentStatus.PENDING,
                type: ShipmentType.OUTBOUND,
                createdAt: { $gte: windowStart }
            })
        });
    }

    const disputedCount = await Shipment.countDocuments({
        status: ShipmentStatus.DISPUTED,
        type: ShipmentType.INBOUND,
        createdAt: { $gte: windowStart }
    });

    if (disputedCount > 0) {
        const whDelayImpact = Math.round(-Math.min(disputedCount * 2, 15) * 10) / 10;
        steps.push({
            category: "Warehouse Delay",
            impact: whDelayImpact,
            description: `${disputedCount} inbound shipment(s) in DISPUTED state blocking inventory`,
            shipmentCount: disputedCount
        });
    }

    const staleInTransit = await Shipment.countDocuments({
        status: ShipmentStatus.IN_TRANSIT,
        updatedAt: { $lt: new Date(now.getTime() - 4 * 60 * 60 * 1000) }
    });

    if (staleInTransit > 0) {
        const trafficImpact = Math.round(-Math.min(staleInTransit * 1.5, 10) * 10) / 10;
        steps.push({
            category: "Traffic / Route Delays",
            impact: trafficImpact,
            description: `${staleInTransit} shipment(s) in transit for more than 4 hours`,
            shipmentCount: staleInTransit
        });
    }

    const backorderedCount = await Shipment.countDocuments({
        status: ShipmentStatus.PENDING,
        type: ShipmentType.OUTBOUND,
        createdAt: { $gte: windowStart }
    });

    if (backorderedCount > 0) {
        const stockImpact = Math.round(-Math.min(backorderedCount, 5) * 10) / 10;
        steps.push({
            category: "Stock / Backorder",
            impact: stockImpact,
            description: `${backorderedCount} outbound orders still pending (insufficient stock)`,
            shipmentCount: backorderedCount
        });
    }

    const primaryCause = steps.length > 0
        ? steps.sort((a, b) => a.impact - b.impact)[0]!.category
        : "None identified";

    return {
        baselineOnTimeRate: baselineRate,
        currentOnTimeRate: currentRate,
        totalDelta,
        steps: steps.sort((a, b) => a.impact - b.impact),
        primaryCause
    };
};

export const getKpiDashboardService = async (): Promise<KpiDashboard> => {
    const cacheKey = "kpi_dashboard";
    const cached = await getCache<KpiDashboard>(cacheKey);
    if (cached) return cached;

    const [
        onTimeRate,
        avgDispatchTime,
        todayShipments,
        detailedUtilization,
        recentActivity,
        platformStats,
        shipmentsByStatus,
        trends
    ] = await Promise.all([
        getOnTimeDeliveryRate(),
        getAverageDispatchTime(),
        getTodayShipmentCount(),
        getDetailedDriverUtilization(),
        getRecentActivity(),
        getPlatformStats(),
        getShipmentStatusDistribution(),
        getShipmentTrends()
    ]);

    const performanceScore = Math.min(100, Math.round(
        (onTimeRate * 0.4) +
        (Math.max(0, 100 - (avgDispatchTime / 60)) * 0.3) +
        (detailedUtilization.reduce((acc, d) => acc + d.utilization, 0) / (detailedUtilization.length || 1) * 0.3)
    )) || 0;

    let causalAnalysis: CausalWaterfall | undefined;
    if (onTimeRate < 80) {
        try {
            causalAnalysis = await analyzeCausalWaterfall(24);
        } catch { }
    }

    const result: KpiDashboard = {
        onTimeRate,
        avgDispatchTime: Math.round(avgDispatchTime / 60000),
        todayShipments,
        driverUtilization: detailedUtilization,
        recentActivity,
        shipmentsByStatus,
        trends,
        performanceScore,
        ...(causalAnalysis && { causalAnalysis }),
        ...platformStats
    };

    await setCache(cacheKey, result, 60);
    return result;
};
