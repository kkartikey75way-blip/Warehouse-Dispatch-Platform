import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, type LatLngExpression } from 'leaflet';
import type { LocationPoint } from '../types';
import 'leaflet/dist/leaflet.css';


import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface LiveTrackingMapProps {
    origin: string;
    destination: string;
    currentLocation?: LocationPoint;
    locationHistory: LocationPoint[];
    estimatedDeliveryTime?: string;
}


const MapCenterUpdater: React.FC<{ center: LatLngExpression }> = ({ center }) => {
    const map = useMap();
    React.useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
    origin,
    destination,
    currentLocation,
    locationHistory,
    estimatedDeliveryTime
}) => {
    
    const originCoords: LatLngExpression = [28.7041, 77.1025]; 
    const destinationCoords: LatLngExpression = [19.0760, 72.8777]; 

    
    const mapCenter: LatLngExpression = currentLocation
        ? [currentLocation.latitude, currentLocation.longitude]
        : originCoords;

    
    const pathCoordinates: LatLngExpression[] = locationHistory.map(loc => [
        loc.latitude,
        loc.longitude
    ]);

    
    const driverIcon = new Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="32" height="32">
                <circle cx="12" cy="12" r="10" fill="#3B82F6" opacity="0.3"/>
                <circle cx="12" cy="12" r="6" fill="#3B82F6"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
        `),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });

    return (
        <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-slate-200">
            <MapContainer
                center={mapCenter}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {}
                <Marker position={originCoords}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-bold text-xs">Origin</p>
                            <p className="text-xs text-slate-600">{origin}</p>
                        </div>
                    </Popup>
                </Marker>

                {}
                <Marker position={destinationCoords}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-bold text-xs">Destination</p>
                            <p className="text-xs text-slate-600">{destination}</p>
                        </div>
                    </Popup>
                </Marker>

                {}
                {currentLocation && (
                    <Marker
                        position={[currentLocation.latitude, currentLocation.longitude]}
                        icon={driverIcon}
                    >
                        <Popup>
                            <div className="text-center">
                                <p className="font-bold text-xs text-primary">Live Location</p>
                                <p className="text-xs text-slate-600">
                                    {new Date(currentLocation.timestamp).toLocaleTimeString()}
                                </p>
                                {estimatedDeliveryTime && (
                                    <p className="text-xs text-slate-600 mt-1">
                                        ETA: {new Date(estimatedDeliveryTime).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )}

                {}
                {pathCoordinates.length > 1 && (
                    <Polyline
                        positions={pathCoordinates}
                        color="#3B82F6"
                        weight={3}
                        opacity={0.7}
                        dashArray="10, 10"
                    />
                )}

                {}
                {currentLocation && (
                    <MapCenterUpdater center={[currentLocation.latitude, currentLocation.longitude]} />
                )}
            </MapContainer>

            {}
            {currentLocation && (
                <div className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500 relative" />
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Live Tracking</span>
                </div>
            )}
        </div>
    );
};

export default LiveTrackingMap;
