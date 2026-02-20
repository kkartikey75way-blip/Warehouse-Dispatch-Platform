import { Request, Response } from 'express';
import { TrackingService } from '../services/tracking.service';
import { ShipmentStatus } from '../constants/shipmentStatus';
import { SocketHandlers } from '../services/socket.handlers';

const trackingService = new TrackingService();


export const updateLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shipmentId, latitude, longitude, accuracy } = req.body;

        if (!shipmentId || latitude === undefined || longitude === undefined) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields: shipmentId, latitude, longitude'
            });
            return;
        }

        const updatedShipment = await trackingService.updateShipmentLocation(
            shipmentId,
            {
                latitude,
                longitude,
                timestamp: new Date(),
                accuracy
            }
        );

        res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            data: {
                currentLocation: updatedShipment.currentLocation,
                estimatedDeliveryTime: updatedShipment.estimatedDeliveryTime
            }
        });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update location'
        });
    }
};


export const updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shipmentId } = req.params;
        const { status, notes } = req.body;

        if (!shipmentId || typeof shipmentId !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Invalid shipmentId'
            });
            return;
        }

        if (!status || !Object.values(ShipmentStatus).includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Invalid or missing status'
            });
            return;
        }

        const userId = (req as Request & { user?: { userId: string } }).user?.userId;
        const updatedShipment = await trackingService.updateShipmentStatus(
            shipmentId,
            status,
            userId,
            notes
        );

        
        SocketHandlers.broadcastStatusUpdate(
            shipmentId,
            status,
            new Date()
        );

        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: {
                status: updatedShipment.status,
                statusHistory: updatedShipment.statusHistory
            }
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update status'
        });
    }
};


export const getTracking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shipmentId } = req.params;

        if (!shipmentId || typeof shipmentId !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Invalid shipmentId'
            });
            return;
        }

        const trackingData = await trackingService.getShipmentTracking(shipmentId);

        res.status(200).json({
            success: true,
            data: trackingData
        });
    } catch (error) {
        console.error('Error fetching tracking data:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch tracking data'
        });
    }
};
