import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../constants/SocketContext';
import type { LocationPoint, StatusHistoryEntry } from '../types';

interface LocationUpdatePayload {
    shipmentId: string;
    location: LocationPoint;
    estimatedDeliveryTime?: string;
}

interface StatusUpdatePayload {
    shipmentId: string;
    status: string;
    timestamp: string;
}

export const useShipmentTracking = (shipmentId: string | null) => {
    const { socket, isConnected } = useSocket();
    const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
    const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string | null>(null);
    const [latestStatus, setLatestStatus] = useState<StatusHistoryEntry | null>(null);

    
    useEffect(() => {
        if (!socket || !isConnected || !shipmentId) return;

        
        socket.emit('subscribe:shipment', shipmentId);
        console.log(`Subscribed to shipment: ${shipmentId}`);

        
        const handleLocationUpdate = (data: LocationUpdatePayload) => {
            if (data.shipmentId === shipmentId) {
                setCurrentLocation(data.location);
                if (data.estimatedDeliveryTime) {
                    setEstimatedDeliveryTime(data.estimatedDeliveryTime);
                }
            }
        };

        
        const handleStatusUpdate = (data: StatusUpdatePayload) => {
            if (data.shipmentId === shipmentId) {
                setLatestStatus({
                    status: data.status,
                    timestamp: data.timestamp
                });
            }
        };

        socket.on('shipment:location', handleLocationUpdate);
        socket.on('shipment:status', handleStatusUpdate);

        
        return () => {
            socket.emit('unsubscribe:shipment', shipmentId);
            socket.off('shipment:location', handleLocationUpdate);
            socket.off('shipment:status', handleStatusUpdate);
            console.log(`Unsubscribed from shipment: ${shipmentId}`);
        };
    }, [socket, isConnected, shipmentId]);

    return {
        currentLocation,
        estimatedDeliveryTime,
        latestStatus,
        isConnected
    };
};


export const useDriverLocation = () => {
    const { socket, isConnected } = useSocket();

    const sendLocationUpdate = useCallback((
        shipmentId: string,
        latitude: number,
        longitude: number,
        accuracy?: number
    ) => {
        if (!socket || !isConnected) {
            console.warn('Socket not connected, cannot send location update');
            return;
        }

        socket.emit('driver:location', {
            shipmentId,
            latitude,
            longitude,
            timestamp: new Date(),
            accuracy
        });
    }, [socket, isConnected]);

    return {
        sendLocationUpdate,
        isConnected
    };
};
