import {
    getOnTimeDeliveryRate,
    getAverageDispatchTime,
    getTodayShipmentCount,
    getDriverUtilization,
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
}

export const getKpiDashboardService = async (): Promise<KpiDashboard> => {
    const cacheKey = "kpi_dashboard";

    const cached = await getCache<KpiDashboard>(cacheKey);

    if (cached) {
        return cached;
    }

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

    const result: KpiDashboard = {
        onTimeRate,
        avgDispatchTime: Math.round(avgDispatchTime / 60000),
        todayShipments,
        driverUtilization: detailedUtilization,
        recentActivity,
        shipmentsByStatus,
        trends,
        performanceScore,
        ...platformStats
    };

    await setCache(cacheKey, result, 60);

    return result;
};
