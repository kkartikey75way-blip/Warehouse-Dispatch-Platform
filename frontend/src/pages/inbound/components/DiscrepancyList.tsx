import { Icons } from "../../../components/Icons";
import { type Shipment } from "../../../types";

interface DiscrepancyListProps {
    shipments: Shipment[];
}

const DiscrepancyList = ({ shipments }: DiscrepancyListProps) => {
    const discrepancyShipments = shipments.filter(s => s.status === 'REPORTED');

    return (
        <div className="space-y-4">
            {discrepancyShipments.map(s => (
                <div key={s._id} className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                        <Icons.AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Mismatch Detected</p>
                        <p className="text-xs font-bold text-red-900 leading-snug">Shipment {s._id.slice(-6).toUpperCase()} is on hold due to SKU/Qty variance.</p>
                    </div>
                </div>
            ))}
            {discrepancyShipments.length === 0 && (
                <p className="text-center py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">No active disputes</p>
            )}
        </div>
    );
};

export default DiscrepancyList;
