import { Icons } from "../../../components/Icons";
import type { Shipment } from "../../../types";
import StatusBadge from "../../../components/StatusBadge";
import Card from "../../../components/Card";
import LiveTrackingMap from "../../../components/LiveTrackingMap";
import StatusTimeline from "../../../components/StatusTimeline";
import { useShipmentTracking } from "../../../hooks/useTracking";
import { useGetPODQuery, useRaiseDisputeMutation } from "../../../services/proofOfDeliveryApi";
import { useAppSelector } from "../../../store/hooks";
import { useState } from "react";
import { useReplayEventsQuery } from "../../../services/shipmentApi";

interface ShipmentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipment: Shipment | null;
}

const ShipmentDetailsModal = ({ isOpen, onClose, shipment }: ShipmentDetailsModalProps) => {
    const { currentLocation, estimatedDeliveryTime, latestStatus, isConnected } = useShipmentTracking(
        isOpen && shipment ? shipment._id : null
    );

    const { user } = useAppSelector((state) => state.auth);
    const { data: pod, isLoading: isLoadingPOD } = useGetPODQuery(shipment?._id ?? "", {
        skip: !isOpen || !shipment || (shipment.status !== 'DELIVERED' && shipment.status !== 'DISPUTED')
    });

    const [raiseDispute] = useRaiseDisputeMutation();
    const [disputeReason, setDisputeReason] = useState("");
    const [isRaisingDispute, setIsRaisingDispute] = useState(false);
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'POD' | 'HISTORY'>('DETAILS');

    const { data: eventHistory, isLoading: isLoadingEvents } = useReplayEventsQuery(shipment?._id ?? "", {
        skip: !isOpen || activeTab !== 'HISTORY'
    });

    if (!isOpen || !shipment) return null;

    const shipmentIdSuffix = shipment?._id ? shipment._id.slice(-6).toUpperCase() : 'N/A';

    const displayLocation = currentLocation || shipment.currentLocation;
    const displayETA = estimatedDeliveryTime || shipment.estimatedDeliveryTime;
    const displayStatus = latestStatus?.status || shipment.status;

    const showMap = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DISPATCHED'].includes(displayStatus);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={onClose} />

            <Card className="relative w-full max-w-2xl max-h-[90vh] bg-white border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden rounded-[2.5rem] p-0 animate-in fade-in zoom-in duration-300 flex flex-col">

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

                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={() => setActiveTab('DETAILS')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DETAILS' ? 'bg-white text-slate-950 shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                        >
                            Logistics Details
                        </button>
                        {(shipment.status === 'DELIVERED' || shipment.status === 'DISPUTED' || pod) && (
                            <button
                                onClick={() => setActiveTab('POD')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'POD' ? 'bg-white text-slate-950 shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                            >
                                Delivery Proof
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('HISTORY')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'HISTORY' ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                        >
                            Event Stream
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                    {activeTab === 'DETAILS' ? (
                        <>
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
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${shipment.priority === 'EXPRESS' ? 'text-red-500' : 'text-primary'}`}>
                                        {shipment.priority}
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
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

                            <div>
                                <StatusTimeline
                                    statusHistory={shipment.statusHistory || []}
                                    currentStatus={displayStatus}
                                />
                            </div>
                        </>
                    ) : activeTab === 'POD' ? (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            {isLoadingPOD ? (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                                    <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                                    <p className="text-xs font-black uppercase tracking-widest">Retrieving Proof of Delivery...</p>
                                </div>
                            ) : pod ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Information</p>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Delivered To</p>
                                                    <p className="text-lg font-black text-slate-900">{pod.recipientName || 'Unspecified'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Timestamp</p>
                                                    <p className="text-sm font-bold text-slate-700">{new Date(pod.deliveredAt).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispute Status</p>
                                                <div className="flex items-center gap-3">
                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pod.disputeStatus === 'NONE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                        {pod.disputeStatus}
                                                    </div>
                                                    {pod.disputeStatus === 'NONE' && (user?.role === 'ADMIN' || user?.role === 'WAREHOUSE_MANAGER') && (
                                                        <button
                                                            onClick={() => setIsRaisingDispute(true)}
                                                            className="text-[10px] font-black text-primary uppercase underline underline-offset-4"
                                                        >
                                                            Raise Dispute
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {pod.hasSignature && (
                                                <div className="bg-white p-6 rounded-3xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Digitized Signature</p>
                                                    <div className="h-32 bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
                                                        <Icons.CheckCircle className="text-emerald-500 w-8 h-8 opacity-20" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Signature Captured</span>
                                                    </div>
                                                </div>
                                            )}
                                            {pod.hasPhoto && (
                                                <div className="bg-white p-6 rounded-3xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Delivery Photo</p>
                                                    <div className="h-48 bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200 overflow-hidden">
                                                        <Icons.Package className="text-slate-200 w-12 h-12" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {pod.disputeWorkflow.length > 0 && (
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispute Audit Log</p>
                                            <div className="space-y-3">
                                                {pod.disputeWorkflow.map((event, idx) => (
                                                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{event.action.replace('_', ' ')}</p>
                                                            <span className="text-[10px] font-bold text-slate-400">
                                                                {new Date(event.performedAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 italic">"{event.notes || 'No notes provided'}"</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{event.performedBy}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isRaisingDispute && (
                                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsRaisingDispute(false)} />
                                            <div className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100">
                                                <h3 className="text-xl font-black text-slate-900 mb-2">Raise Delivery Dispute</h3>
                                                <p className="text-xs font-bold text-slate-500 mb-6">Describe the issue with this delivery for the audit trail.</p>
                                                <textarea
                                                    value={disputeReason}
                                                    onChange={(e) => setDisputeReason(e.target.value)}
                                                    placeholder="e.g. Recipient claims non-receipt despite signed POD..."
                                                    className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none mb-6"
                                                />
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => setIsRaisingDispute(false)}
                                                        className="flex-1 py-3 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            await raiseDispute({ shipmentId: shipment._id, reason: disputeReason });
                                                            setIsRaisingDispute(false);
                                                            setDisputeReason("");
                                                        }}
                                                        disabled={!disputeReason}
                                                        className="flex-1 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-200 disabled:opacity-50"
                                                    >
                                                        Trigger Dispute
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                                    No delivery proof available yet
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {isLoadingEvents ? (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                                    <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                                    <p className="text-xs font-black uppercase tracking-widest">Replaying Event Stream...</p>
                                </div>
                            ) : eventHistory && eventHistory.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 mb-8">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 text-center">Immutable Event Ledger</p>
                                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                    <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                        {eventHistory.map((event, idx) => (
                                            <div key={idx} className="relative pl-10 group">
                                                <div className="absolute left-0 top-1.5 w-6 h-6 bg-white border-2 border-slate-900 rounded-full z-10 group-hover:scale-125 transition-all shadow-sm flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{event.type.replace(/_/g, ' ')}</span>
                                                        <span className="text-[10px] font-bold text-slate-400">{new Date(event.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:shadow-xl transition-all">
                                                        {event.metadata && (
                                                            <pre className="text-[10px] font-mono text-slate-500 overflow-x-auto">
                                                                {JSON.stringify(event.metadata, null, 2)}
                                                            </pre>
                                                        )}
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-3">Sequence ID: {event._id || idx}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                                    No historical events found
                                </div>
                            )}
                        </div>
                    )}
                </div>

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
