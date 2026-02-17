import Card from "../../../components/Card";

import { Icons } from "../../../components/Icons";
import type { Dispatch } from "../../../types";

interface ActiveDispatchesSectionProps {
    dispatches?: Dispatch[];
    isLoading: boolean;
    error: boolean;
}

const ActiveDispatchesSection = ({ dispatches, isLoading, error }: ActiveDispatchesSectionProps) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Icons.Truck />
                Active Dispatches
            </h2>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                    Failed to load dispatches.
                </div>
            )}

            <Card className="p-0 overflow-hidden border-none shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipment</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                [1, 2, 3].map(i => <tr key={i}><td colSpan={4} className="px-6 py-8 animate-pulse bg-slate-50/50" /></tr>)
                            ) : dispatches?.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No active dispatches</td></tr>
                            ) : (
                                dispatches?.map((d) => (
                                    <tr key={d._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 text-sm font-bold text-slate-900">{d.shipmentId?.trackingId || 'N/A'}</td>
                                        <td className="px-6 py-5 text-sm font-bold text-slate-600">{d.driverId?.userId?.name || 'Unassigned'}</td>
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-black px-2 py-1 bg-primary/5 text-primary rounded-md uppercase tracking-wider">
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-medium text-slate-400">
                                            {new Date(d.dispatchTime).toLocaleString()}
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

export default ActiveDispatchesSection;
