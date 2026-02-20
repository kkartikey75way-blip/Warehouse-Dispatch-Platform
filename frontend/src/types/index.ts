export interface LocationPoint {
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy?: number;
}

export interface StatusHistoryEntry {
    status: string;
    timestamp: string;
    updatedBy?: string;
    notes?: string;
}

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
    currentLocation?: LocationPoint;
    locationHistory: LocationPoint[];
    statusHistory: StatusHistoryEntry[];
    estimatedDeliveryTime?: string;
    expectedQuantity?: number;
    actualQuantity?: number;
    actualSku?: string;
    discrepancyType?: 'NONE' | 'OVER_SHIPMENT' | 'UNDER_SHIPMENT' | 'WRONG_SKU';
    disputeResolved?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RecentActivity {
    description: string;
    time: string;
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

export interface DriverUtilization {
    name: string;
    utilization: number;
    deliveries?: number;
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
    driverUtilization: DriverUtilization[];
    recentActivity: RecentActivity[];
    trends: Array<{ name: string; value: number }>;
    performanceScore: number;
    causalAnalysis?: CausalWaterfall;
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

export interface ShipmentEvent {
    _id: string;
    type: string;
    timestamp: string;
    metadata: Record<string, unknown>;
}

export interface Conflict {
    id: string;
    type: string;
    description: string;
}
