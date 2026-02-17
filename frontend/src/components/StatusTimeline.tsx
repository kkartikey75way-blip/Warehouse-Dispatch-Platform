import React from 'react';
import { Icons } from './Icons';
import type { StatusHistoryEntry } from '../types';

interface StatusTimelineProps {
    statusHistory: StatusHistoryEntry[];
    currentStatus: string;
}

const statusConfig = {
    RECEIVED: {
        icon: Icons.Package,
        label: 'Received',
        description: 'Shipment received at warehouse'
    },
    PACKED: {
        icon: Icons.Package,
        label: 'Packed',
        description: 'Package prepared for dispatch'
    },
    DISPATCHED: {
        icon: Icons.Truck,
        label: 'Dispatched',
        description: 'Assigned to driver and dispatched'
    },
    IN_TRANSIT: {
        icon: Icons.Truck,
        label: 'In Transit',
        description: 'On the way to destination'
    },
    OUT_FOR_DELIVERY: {
        icon: Icons.MapPin,
        label: 'Out for Delivery',
        description: 'Driver is nearby, delivery soon'
    },
    DELIVERED: {
        icon: Icons.CheckCircle,
        label: 'Delivered',
        description: 'Successfully delivered'
    },
    RETURNED: {
        icon: Icons.X,
        label: 'Returned',
        description: 'Shipment returned to warehouse'
    }
};

const statusOrder = [
    'RECEIVED',
    'PACKED',
    'DISPATCHED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED'
];

const StatusTimeline: React.FC<StatusTimelineProps> = ({ statusHistory, currentStatus }) => {
    const getStatusIndex = (status: string) => statusOrder.indexOf(status);
    const currentIndex = getStatusIndex(currentStatus);

    const getStatusEntry = (status: string): StatusHistoryEntry | undefined => {
        return statusHistory.find(entry => entry.status === status);
    };

    const isCompleted = (status: string) => {
        const statusIndex = getStatusIndex(status);
        return statusIndex <= currentIndex && statusIndex !== -1;
    };

    const isCurrent = (status: string) => status === currentStatus;

    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                Shipment Journey
            </p>

            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />

                {statusOrder.map((status) => {
                    const config = statusConfig[status as keyof typeof statusConfig];
                    const entry = getStatusEntry(status);
                    const completed = isCompleted(status);
                    const current = isCurrent(status);
                    const Icon = config.icon;

                    return (
                        <div key={status} className="relative flex gap-4 pb-6 last:pb-0">
                            {/* Icon circle */}
                            <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${completed
                                ? 'bg-primary border-primary shadow-lg shadow-primary/20'
                                : 'bg-white border-slate-200'
                                } ${current ? 'ring-4 ring-primary/20 animate-pulse' : ''}`}>
                                <div style={{ color: completed ? 'white' : '#94a3b8' }}>
                                    <Icon />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-0.5">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className={`text-sm font-bold ${completed ? 'text-slate-900' : 'text-slate-400'
                                            }`}>
                                            {config.label}
                                        </p>
                                        <p className={`text-xs ${completed ? 'text-slate-600' : 'text-slate-400'
                                            }`}>
                                            {config.description}
                                        </p>
                                        {entry?.notes && (
                                            <p className="text-xs text-slate-500 mt-1 italic">
                                                {entry.notes}
                                            </p>
                                        )}
                                    </div>
                                    {entry && (
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {new Date(entry.timestamp).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs font-black text-primary">
                                                {new Date(entry.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusTimeline;
