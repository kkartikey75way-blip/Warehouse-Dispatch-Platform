import { Shipment, LocationPoint, StatusHistoryEntry } from '../models/shipment.model';
import { ShipmentStatus } from '../constants/shipmentStatus';
import { TrackingData } from '../types/location.types';

export class TrackingService {
    
    async updateShipmentLocation(
        shipmentId: string,
        location: LocationPoint
    ): Promise<typeof Shipment.prototype> {
        const shipment = await Shipment.findById(shipmentId);

        if (!shipment) {
            throw new Error('Shipment not found');
        }

        
        shipment.currentLocation = location;

        
        shipment.locationHistory.push(location);

        
        if (shipment.status === ShipmentStatus.IN_TRANSIT ||
            shipment.status === ShipmentStatus.OUT_FOR_DELIVERY) {
            shipment.estimatedDeliveryTime = this.calculateETA(shipment);
        }

        await shipment.save();
        return shipment;
    }

    
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

        
        shipment.status = status;

        
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

    
    private calculateETA(shipment: typeof Shipment.prototype): Date {
        
        
        
        
        
        
        const eta = new Date();
        eta.setHours(eta.getHours() + 2);
        return eta;
    }

    
    private calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371; 
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
