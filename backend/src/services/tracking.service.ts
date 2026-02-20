import { Shipment, LocationPoint } from '../models/shipment.model';
import { ShipmentStatus } from '../constants/shipmentStatus';
import { TrackingData } from '../types/location.types';
import { ShipmentEvent, ShipmentEventType } from '../models/shipmentEvent.model';
import { Types } from 'mongoose';

export class TrackingService {
    private async appendEvent(
        shipmentId: string,
        eventType: ShipmentEventType,
        payload: Record<string, unknown>,
        actorId?: string,
        actorRole?: string,
        previousStatus?: ShipmentStatus,
        newStatus?: ShipmentStatus
    ): Promise<void> {
        const eventDoc: Record<string, unknown> = {
            shipmentId: new Types.ObjectId(shipmentId),
            eventType,
            timestamp: new Date(),
            payload
        };
        if (actorId !== undefined) eventDoc.actorId = actorId;
        if (actorRole !== undefined) eventDoc.actorRole = actorRole;
        if (previousStatus !== undefined) eventDoc.previousStatus = previousStatus;
        if (newStatus !== undefined) eventDoc.newStatus = newStatus;

        await ShipmentEvent.create(eventDoc);
    }

    async updateShipmentLocation(
        shipmentId: string,
        location: LocationPoint,
        actorId?: string,
        actorRole?: string
    ): Promise<typeof Shipment.prototype> {
        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) throw new Error('Shipment not found');

        shipment.currentLocation = location;
        shipment.locationHistory.push(location);

        if (shipment.status === ShipmentStatus.IN_TRANSIT || shipment.status === ShipmentStatus.OUT_FOR_DELIVERY) {
            shipment.estimatedDeliveryTime = this.calculateETA(shipment);
        }

        await shipment.save();

        await this.appendEvent(
            shipmentId,
            ShipmentEventType.LOCATION_UPDATE,
            {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                timestamp: location.timestamp
            },
            actorId,
            actorRole
        );

        return shipment;
    }

    async updateShipmentStatus(
        shipmentId: string,
        status: ShipmentStatus,
        updatedBy?: string,
        notes?: string,
        actorRole?: string
    ): Promise<typeof Shipment.prototype> {
        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) throw new Error('Shipment not found');

        const previousStatus = shipment.status;
        shipment.status = status;
        shipment.statusHistory.push({
            status,
            timestamp: new Date(),
            ...(updatedBy && { updatedBy }),
            ...(notes && { notes })
        });

        await shipment.save();

        await this.appendEvent(
            shipmentId,
            ShipmentEventType.STATUS_CHANGE,
            { notes: notes ?? null, updatedBy: updatedBy ?? null },
            updatedBy,
            actorRole,
            previousStatus,
            status
        );

        return shipment;
    }

    async getShipmentTracking(shipmentId: string): Promise<TrackingData> {
        const shipment = await Shipment.findById(shipmentId).populate('assignedDriverId').lean();
        if (!shipment) throw new Error('Shipment not found');

        return {
            shipmentId: shipment._id.toString(),
            currentLocation: shipment.currentLocation,
            locationHistory: shipment.locationHistory || [],
            statusHistory: shipment.statusHistory || [],
            estimatedDeliveryTime: shipment.estimatedDeliveryTime
        };
    }

    async getStatusAtTime(shipmentId: string, atTime: Date): Promise<ShipmentStatus | null> {
        const events = await ShipmentEvent.find({
            shipmentId: new Types.ObjectId(shipmentId),
            eventType: ShipmentEventType.STATUS_CHANGE,
            timestamp: { $lte: atTime }
        }).sort({ timestamp: 1 }).lean();

        if (events.length === 0) {
            const shipment = await Shipment.findById(shipmentId).lean();
            if (!shipment) return null;
            if (new Date(shipment.createdAt) > atTime) return null;

            const initialEntry = (shipment.statusHistory || [])
                .filter(h => new Date(h.timestamp) <= atTime)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

            return initialEntry?.status ?? null;
        }

        const lastEvent = events[events.length - 1];
        return lastEvent?.newStatus ?? null;
    }

    async getEventsBetween(shipmentId: string, from: Date, to: Date): Promise<Array<typeof ShipmentEvent.prototype>> {
        return ShipmentEvent.find({
            shipmentId: new Types.ObjectId(shipmentId),
            timestamp: { $gte: from, $lte: to }
        }).sort({ timestamp: 1 }).lean() as Promise<Array<typeof ShipmentEvent.prototype>>;
    }

    async replayEvents(shipmentId: string): Promise<{
        currentStatus: ShipmentStatus | null;
        eventCount: number;
        timeline: Array<{ timestamp: Date; eventType: string; payload: Record<string, unknown> }>;
    }> {
        const events = await ShipmentEvent.find({
            shipmentId: new Types.ObjectId(shipmentId)
        }).sort({ timestamp: 1 }).lean();

        let currentStatus: ShipmentStatus | null = null;
        for (const event of events) {
            if (event.eventType === ShipmentEventType.STATUS_CHANGE && event.newStatus) {
                currentStatus = event.newStatus;
            }
        }

        return {
            currentStatus,
            eventCount: events.length,
            timeline: events.map(e => ({
                timestamp: e.timestamp,
                eventType: e.eventType,
                payload: e.payload
            }))
        };
    }

    private calculateETA(shipment: typeof Shipment.prototype): Date {
        const eta = new Date();
        eta.setHours(eta.getHours() + 2);
        return eta;
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}
