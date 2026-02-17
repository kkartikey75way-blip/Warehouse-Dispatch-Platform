import Card from "../../../components/Card";
import Button from "../../../components/Button";
import { Icons } from "../../../components/IconRegistry";

import type { Shipment } from "../../../types";

interface DeliveryCardProps {
    shipment: Shipment;
    onAccept: (shipmentId: string) => void;
    onStart: (shipmentId: string) => void;
    onFinish: (shipmentId: string) => void;
    onReportIssue: (shipmentId: string) => void;
    isAccepting: boolean;
    isStarting: boolean;
}

const DeliveryCard = ({
    shipment,
    onAccept,
    onStart,
    onFinish,
    onReportIssue,
    isAccepting,
    isStarting
}: DeliveryCardProps) => {
    const isDelivered = shipment.status === 'DELIVERED';
    const isInTransit = shipment.status === 'IN_TRANSIT';
    const isDispatched = shipment.status === 'DISPATCHED';

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'IN_TRANSIT': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'DISPATCHED': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <Card className="group relative overflow-hidden p-0 border-none shadow-2xl shadow-slate-200/50 hover:shadow-3xl transition-all duration-500 glass">
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-full -mr-16 -mt-16 pointer-events-none transition-all duration-700 group-hover:scale-150 ${isDelivered ? 'bg-emerald-500' : 'bg-primary'}`} />

            <div className="flex flex-col lg:flex-row p-8 gap-8 items-center">
                <div className="flex-1 flex flex-col md:flex-row items-center gap-8 w-full">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:rotate-6 ${isDelivered ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                        <Icons.Package className="w-8 h-8" />
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        <div className="flex flex-wrap items-center gap-4">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{shipment.trackingId}</h3>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.15em] border ${getStatusStyles(shipment.status)}`}>
                                {shipment.status}
                            </span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Route Protocol</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-slate-700">{shipment.origin}</span>
                                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                    <span className="text-sm font-bold text-slate-900">{shipment.destination}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payload Spec</p>
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase tracking-tighter">WT: {shipment.weight} KG</span>
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase tracking-tighter">PRIO: {shipment.priority}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full lg:w-auto justify-center md:justify-end border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                    {isDispatched && !shipment.acceptedByDriver && (
                        <Button
                            onClick={() => onAccept(shipment._id)}
                            isLoading={isAccepting}
                            className="bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-200 text-white h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-y-1 active:translate-y-0"
                        >
                            Accept Dispatch
                        </Button>
                    )}
                    {isDispatched && shipment.acceptedByDriver && (
                        <Button
                            onClick={() => onStart(shipment._id)}
                            isLoading={isStarting}
                            className="bg-slate-900 hover:bg-primary shadow-xl shadow-slate-200 text-white h-14 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-y-1 active:translate-y-0"
                        >
                            Ignition & Start
                        </Button>
                    )}
                    {isInTransit && (
                        <div className="flex gap-4 w-full md:w-auto">
                            <Button
                                onClick={() => onFinish(shipment._id)}
                                className="flex-1 md:flex-none bg-primary hover:bg-slate-900 shadow-xl shadow-primary/20 text-white h-14 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-y-1"
                            >
                                Confirm Delivery
                            </Button>
                            <Button
                                onClick={() => onReportIssue(shipment._id)}
                                variant="secondary"
                                className="flex-1 md:flex-none bg-red-50 hover:bg-red-100 text-red-600 h-14 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-100"
                            >
                                Report Exception
                            </Button>
                        </div>
                    )}
                    {isDelivered && (
                        <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
                            <Icons.CheckCircle className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Transaction Verified</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default DeliveryCard;
