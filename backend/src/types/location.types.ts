export interface LocationUpdate {
    shipmentId: string;
    latitude: number;
    longitude: number;
    timestamp: Date;
    accuracy?: number;
}

export interface StatusHistoryEntry {
    status: string;
    timestamp: Date;
    updatedBy?: string;
    notes?: string;
}

export interface LocationPoint {
    latitude: number;
    longitude: number;
    timestamp: Date;
    accuracy?: number;
}

export interface TrackingData {
    shipmentId: string;
    currentLocation?: LocationPoint | undefined;
    locationHistory: LocationPoint[];
    statusHistory: StatusHistoryEntry[];
    estimatedDeliveryTime?: Date | undefined;
}


export enum SocketEvents {
    
    SUBSCRIBE_SHIPMENT = 'subscribe:shipment',
    UNSUBSCRIBE_SHIPMENT = 'unsubscribe:shipment',
    DRIVER_LOCATION_UPDATE = 'driver:location',

    
    SHIPMENT_LOCATION_UPDATE = 'shipment:location',
    SHIPMENT_STATUS_UPDATE = 'shipment:status',
    CONNECTION_ERROR = 'connection:error',
}
