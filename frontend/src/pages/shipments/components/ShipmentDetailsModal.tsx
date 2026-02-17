import { Icons } from "../../../components/Icons";
import type { Shipment } from "../../../types";
import StatusBadge from "../../../components/StatusBadge";
import Card from "../../../components/Card";
import LiveTrackingMap from "../../../components/LiveTrackingMap";
import StatusTimeline from "../../../components/StatusTimeline";
import { useShipmentTracking } from "../../../hooks/useTracking";

interface ShipmentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipment: Shipment | null;
}

const ShipmentDetailsModal = ({ isOpen, onClose, shipment }: ShipmentDetailsModalProps) => {
    console.log("ShipmentDetailsModal render - isOpen:", isOpen, "shipment:", shipment);

    // Subscribe to real-time updates for this shipment
    const { currentLocation, estimatedDeliveryTime, latestStatus, isConnected } = useShipmentTracking(
        isOpen && shipment ? shipment._id : null
    );

    if (!isOpen || !shipment) return null;

    const shipmentIdSuffix = shipment?._id ? shipment._id.slice(-6).toUpperCase() : 'N/A';

    // Use real-time location if available, otherwise use shipment's stored location
    const displayLocation = currentLocation || shipment.currentLocation;
    const displayETA = estimatedDeliveryTime || shipment.estimatedDeliveryTime;
    const displayStatus = latestStatus?.status || shipment.status;

    // Show tracking map for shipments in transit
    const showMap = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DISPATCHED'].includes(displayStatus);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={onClose} />

            <Card className="relative w-full max-w-2xl max-h-[90vh] bg-white border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden rounded-[2.5rem] p-0 animate-in fade-in zoom-in duration-300 flex flex-col">
                {/* Header Section */}
                <div className="bg-slate-950 p-8 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">System Tracking ID</span>
                                <div className="px-2 py-0.5 rounded bg-primary/20 border border-primary/30">
                                    <span className="text-[10px] font-black text-primary">SHIP-{shipmentIdSuffix}</span>
                                </div>
                            </div>
                            <p className="text-3xl font-black tracking-tight text-white">{shipment.trackingId}</p>
                            {isConnected && showMap && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Live Updates Active</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <Icons.X />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                    {/* Primary Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU Reference</p>
                            <p className="font-mono text-sm font-bold text-slate-700">{shipment.sku}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity</p>
                            <p className="text-sm font-black text-slate-700">{shipment.quantity} Units</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                            <StatusBadge status={shipment.status} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</p>
                            <span className={`text-[10px] font-black uppercase tracking-tight ${shipment.priority === 'EXPRESS' ? 'text-red-500' : 'text-primary'
                                }`}>
                                {shipment.priority}
                            </span>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Two Column Layout: Details on Left, Map on Right */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Shipment Details */}
                        <div className="space-y-6">
                            {/* Route Info */}
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <div className="w-px h-12 bg-slate-100 my-1" />
                                        <Icons.MapPin />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Origin</p>
                                            <p className="text-sm font-bold text-slate-700">{shipment.origin}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Destination</p>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-700">{shipment.destination}</p>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Zone: {shipment.zone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Physical Specs */}
                            <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Specifications</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-500">Gross Weight</span>
                                    <span className="font-black text-slate-700">{shipment.weight} kg</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-500">Total Volume</span>
                                    <span className="font-black text-slate-700">{shipment.volume} m³</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-500">Service Type</span>
                                    <span className="font-black text-slate-700 uppercase tracking-tight">{shipment.type}</span>
                                </div>
                            </div>

                            {/* Meta Information */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Manifest Association</p>
                                    <p className="text-xs font-black text-slate-600">{shipment.batchId || 'PENDING ASSIGNMENT'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">System Entry</p>
                                    <p className="text-xs font-bold text-slate-600">{new Date(shipment.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Live Tracking Map */}
                        {showMap && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Tracking</p>
                                    {displayETA && (
                                        <p className="text-xs font-bold text-primary">
                                            ETA: {new Date(displayETA).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                <LiveTrackingMap
                                    origin={shipment.origin}
                                    destination={shipment.destination}
                                    currentLocation={displayLocation}
                                    locationHistory={shipment.locationHistory || []}
                                    estimatedDeliveryTime={displayETA}
                                />
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Status Timeline - Full Width */}
                    <div>
                        <StatusTimeline
                            statusHistory={shipment.statusHistory || []}
                            currentStatus={displayStatus}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 pt-0 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10"
                    >
                        Dismiss Overlay
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default ShipmentDetailsModal;
