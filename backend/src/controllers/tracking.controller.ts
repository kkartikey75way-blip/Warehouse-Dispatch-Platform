import { Request, Response } from 'express';
import { TrackingService } from '../services/tracking.service';
import { ShipmentStatus } from '../constants/shipmentStatus';
import { SocketHandlers } from '../services/socket.handlers';

const trackingService = new TrackingService();

export const updateLocation = async (req: Request, res: Response): Promise<void> => {
    const { shipmentId, latitude, longitude, accuracy } = req.body;
    const actorId = (req as Request & { user?: { userId: string } }).user?.userId;

    if (!shipmentId || latitude === undefined || longitude === undefined) {
        res.status(400).json({
            success: false,
            message: 'Missing required fields: shipmentId, latitude, longitude'
        });
        return;
    }

    const updatedShipment = await trackingService.updateShipmentLocation(
        shipmentId,
        { latitude, longitude, timestamp: new Date(), accuracy },
        actorId,
        'DRIVER'
    );

    res.status(200).json({
        success: true,
        message: 'Location updated successfully',
        data: {
            currentLocation: updatedShipment.currentLocation,
            estimatedDeliveryTime: updatedShipment.estimatedDeliveryTime
        }
    });
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { shipmentId } = req.params;
    const { status, notes } = req.body;
    const user = (req as Request & { user?: { userId: string; role: string } }).user;

    if (!shipmentId || typeof shipmentId !== 'string') {
        res.status(400).json({ success: false, message: 'Invalid shipmentId' });
        return;
    }

    if (!status || !Object.values(ShipmentStatus).includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid or missing status' });
        return;
    }

    const updatedShipment = await trackingService.updateShipmentStatus(
        shipmentId, status, user?.userId, notes, user?.role
    );

    SocketHandlers.broadcastStatusUpdate(shipmentId, status, new Date());

    res.status(200).json({
        success: true,
        message: 'Status updated successfully',
        data: {
            status: updatedShipment.status,
            statusHistory: updatedShipment.statusHistory
        }
    });
};

export const getTracking = async (req: Request, res: Response): Promise<void> => {
    const { shipmentId } = req.params as { shipmentId: string };
    if (!shipmentId) {
        res.status(400).json({ success: false, message: 'Invalid shipmentId' });
        return;
    }

    const trackingData = await trackingService.getShipmentTracking(shipmentId);
    res.status(200).json({ success: true, data: trackingData });
};

export const getStatusAtTime = async (req: Request, res: Response): Promise<void> => {
    const { shipmentId } = req.params as { shipmentId: string };
    const { time } = req.query as { time?: string };

    if (!shipmentId) {
        res.status(400).json({ success: false, message: 'Invalid shipmentId' });
        return;
    }

    if (!time) {
        res.status(400).json({ success: false, message: 'Query param "time" is required (ISO date)' });
        return;
    }

    const timeStr = Array.isArray(time) ? time[0]! : time;
    const atTime = new Date(timeStr);
    if (isNaN(atTime.getTime())) {
        res.status(400).json({ success: false, message: 'Invalid "time" format, use ISO 8601' });
        return;
    }

    const status = await trackingService.getStatusAtTime(shipmentId, atTime);

    res.status(200).json({
        success: true,
        data: { shipmentId, atTime, status }
    });
};

export const replayEvents = async (req: Request, res: Response): Promise<void> => {
    const { shipmentId } = req.params as { shipmentId: string };
    if (!shipmentId) {
        res.status(400).json({ success: false, message: 'Invalid shipmentId' });
        return;
    }

    const result = await trackingService.replayEvents(shipmentId);
    res.status(200).json({ success: true, data: result });
};
