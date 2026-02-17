export interface Shipment {
    _id: string;
    trackingId: string;
    sku: string;
    quantity: number;
    type: string;
    priority: string;
    status: string;
    zone: string;
    origin: string;
    destination: string;
    weight: number;
    volume: number;
    assignedDriverId?: string;
    acceptedByDriver?: boolean;
    acceptedAt?: string;
    batchId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RecentActivity {
    description: string;
    time: string;
}

export interface KpiDashboard {
    onTimeRate: number;
    avgDispatchTime: number;
    todayShipments: number;
    totalShipments: number;
    dispatchedToday: number;
    deliveredToday: number;
    activeDrivers: number;
    shipmentsByStatus?: Array<{ _id: string; count: number }>;
    driverUtilization: Array<{ name: string; utilization: number; deliveries?: number }>;
    recentActivity: RecentActivity[];
    trends: Array<{ name: string; value: number }>;
    performanceScore: number;
}

export interface Dispatch {
    _id: string;
    shipmentId: {
        _id: string;
        trackingId: string;
    };
    driverId: {
        _id: string;
        userId: {
            name: string;
        };
    };
    status: string;
    dispatchTime: string;
}

export interface Delivery {
    _id: string;
    shipmentId: string;
    driverId: string;
    proofOfDelivery?: string;
    exceptionReport?: string;
    status: string;
    deliveredAt?: string;
}
