import { Socket } from 'socket.io';
import { getIO } from '../config/socket.config';
import { SocketEvents, LocationUpdate } from '../types/location.types';
import { TrackingService } from './tracking.service';

export class SocketHandlers {
    private trackingService: TrackingService;

    constructor() {
        this.trackingService = new TrackingService();
    }

    public initialize(): void {
        const io = getIO();

        io.on('connection', (socket: Socket) => {
            socket.on(SocketEvents.SUBSCRIBE_SHIPMENT, (shipmentId: string) => {
                socket.join(`shipment:${shipmentId}`);
            });

            socket.on(SocketEvents.UNSUBSCRIBE_SHIPMENT, (shipmentId: string) => {
                socket.leave(`shipment:${shipmentId}`);
            });

            socket.on(SocketEvents.DRIVER_LOCATION_UPDATE, async (data: LocationUpdate) => {
                try {
                    const updatedShipment = await this.trackingService.updateShipmentLocation(
                        data.shipmentId,
                        {
                            latitude: data.latitude,
                            longitude: data.longitude,
                            timestamp: new Date(data.timestamp),
                            ...(data.accuracy !== undefined && { accuracy: data.accuracy })
                        }
                    );

                    io.to(`shipment:${data.shipmentId}`).emit(
                        SocketEvents.SHIPMENT_LOCATION_UPDATE,
                        {
                            shipmentId: data.shipmentId,
                            location: updatedShipment.currentLocation,
                            estimatedDeliveryTime: updatedShipment.estimatedDeliveryTime
                        }
                    );
                } catch (error) {
                    socket.emit(SocketEvents.CONNECTION_ERROR, {
                        message: 'Failed to update location',
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            });

            socket.on('disconnect', () => { });
        });
    }

    public static broadcastStatusUpdate(shipmentId: string, status: string, timestamp: Date): void {
        const io = getIO();
        io.to(`shipment:${shipmentId}`).emit(SocketEvents.SHIPMENT_STATUS_UPDATE, {
            shipmentId,
            status,
            timestamp
        });
    }
}
