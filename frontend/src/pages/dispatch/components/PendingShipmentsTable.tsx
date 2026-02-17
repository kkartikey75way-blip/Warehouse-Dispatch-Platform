import Card from "../../../components/Card";
import Button from "../../../components/Button";
import StatusBadge from "../../../components/StatusBadge";
import { Icons } from "../../../components/Icons";
import type { Shipment } from "../../../types";

interface PendingShipmentsTableProps {
    shipments: Shipment[];
    selectedShipments: string[];
    isLoading: boolean;
    onToggleSelection: (id: string) => void;
    onSelectAll: (selected: boolean) => void;
    onAssignClick: () => void;
}

const PendingShipmentsTable = ({
    shipments,
    selectedShipments,
    isLoading,
    onToggleSelection,
    onSelectAll,
    onAssignClick
}: PendingShipmentsTableProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Icons.Package />
                    Pending Shipments
                </h2>
                {selectedShipments.length > 0 && (
                    <Button onClick={onAssignClick} className="animate-in fade-in slide-in-from-right-4">
                        Assign {selectedShipments.length} to Driver
                    </Button>
                )}
            </div>

            <Card className="p-0 overflow-hidden border-none shadow-sm">
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white z-10 shadow-sm">
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => onSelectAll(e.target.checked)}
                                        checked={shipments.length > 0 && selectedShipments.length === shipments.length}
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                [1, 2].map(i => <tr key={i}><td colSpan={5} className="px-6 py-8 animate-pulse bg-slate-50/50" /></tr>)
                            ) : shipments.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No pending shipments</td></tr>
                            ) : (
                                shipments.map((s) => (
                                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => onToggleSelection(s._id)}>
                                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedShipments.includes(s._id)}
                                                onChange={() => onToggleSelection(s._id)}
                                                className="rounded border-slate-300 text-primary focus:ring-primary"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{s.trackingId}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{s.zone}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{s.weight}kg</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={s.status} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default PendingShipmentsTable;
