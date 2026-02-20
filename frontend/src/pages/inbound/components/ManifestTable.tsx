import StatusBadge from "../../../components/StatusBadge";
import { type Shipment } from "../../../types";

interface ManifestTableProps {
    shipments: Shipment[];
    selectedShipment: string | null;
    onSelect: (id: string) => void;
}

const ManifestTable = ({ shipments, selectedShipment, onSelect }: ManifestTableProps) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left border-b border-slate-50">
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipment ID</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {shipments.map((s) => (
                        <tr key={s._id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 font-black text-xs text-slate-900">{s._id.slice(-8).toUpperCase()}</td>
                            <td className="py-4 text-xs font-bold text-slate-600">{s.origin}</td>
                            <td className="py-4">
                                <StatusBadge status={s.status} />
                            </td>
                            <td className="py-4 text-right">
                                <button
                                    onClick={() => onSelect(s._id)}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedShipment === s._id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-slate-50 text-slate-600 hover:bg-primary/5 hover:text-primary'
                                        }`}
                                >
                                    Process
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManifestTable;
