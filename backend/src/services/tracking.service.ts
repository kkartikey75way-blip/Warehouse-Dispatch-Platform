import { Shipment, LocationPoint, StatusHistoryEntry } from '../models/shipment.model';
import { ShipmentStatus } from '../constants/shipmentStatus';
import { TrackingData } from '../types/location.types';

export class TrackingService {
    /**
     * Update shipment location and add to history
     */
    async updateShipmentLocation(
        shipmentId: string,
        location: LocationPoint
    ): Promise<typeof Shipment.prototype> {
        const shipment = await Shipment.findById(shipmentId);

        if (!shipment) {
            throw new Error('Shipment not found');
        }

        // Update current location
        shipment.currentLocation = location;

        // Add to location history
        shipment.locationHistory.push(location);

        // Calculate ETA if shipment is in transit
        if (shipment.status === ShipmentStatus.IN_TRANSIT ||
            shipment.status === ShipmentStatus.OUT_FOR_DELIVERY) {
            shipment.estimatedDeliveryTime = this.calculateETA(shipment);
        }

        await shipment.save();
        return shipment;
    }

    /**
     * Update shipment status and record in history
     */
    async updateShipmentStatus(
        shipmentId: string,
        status: ShipmentStatus,
        updatedBy?: string,
        notes?: string
    ): Promise<typeof Shipment.prototype> {
        const shipment = await Shipment.findById(shipmentId);

        if (!shipment) {
            throw new Error('Shipment not found');
        }

        // Update status
        shipment.status = status;

        // Add to status history
        const historyEntry: StatusHistoryEntry = {
            status,
            timestamp: new Date(),
            ...(updatedBy && { updatedBy }),
            ...(notes && { notes })
        };
        shipment.statusHistory.push(historyEntry);

        await shipment.save();
        return shipment;
    }

    /**
     * Get complete tracking information for a shipment
     */
    async getShipmentTracking(shipmentId: string): Promise<TrackingData> {
        const shipment = await Shipment.findById(shipmentId)
            .populate('assignedDriverId')
            .lean();

        if (!shipment) {
            throw new Error('Shipment not found');
        }

        return {
            shipmentId: shipment._id.toString(),
            currentLocation: shipment.currentLocation,
            locationHistory: shipment.locationHistory || [],
            statusHistory: shipment.statusHistory || [],
            estimatedDeliveryTime: shipment.estimatedDeliveryTime
        };
    }

    /**
     * Calculate estimated delivery time based on distance and average speed
     * This is a simplified calculation - in production, you'd use routing APIs
     */
    private calculateETA(shipment: typeof Shipment.prototype): Date {
        // For now, return a simple estimate (2 hours from now)
        // In production, you'd calculate based on:
        // - Current location
        // - Destination coordinates
        // - Traffic conditions
        // - Historical delivery times
        const eta = new Date();
        eta.setHours(eta.getHours() + 2);
        return eta;
    }

    /**
     * Calculate distance between two points (Haversine formula)
     */
    private calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}
