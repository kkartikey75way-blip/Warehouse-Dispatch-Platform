import Card from "../../../components/Card";

interface StatusDistributionProps {
    data: Array<{ _id: string; count: number }>;
}

const statusColors: Record<string, string> = {
    RECEIVED: 'bg-emerald-500',
    PACKED: 'bg-blue-500',
    DISPATCHED: 'bg-amber-500',
    IN_TRANSIT: 'bg-indigo-500',
    DELIVERED: 'bg-green-500',
    RETURNED: 'bg-red-500',
};

const StatusDistribution = ({ data }: StatusDistributionProps) => {
    const total = data.reduce((acc, curr) => acc + curr.count, 0) || 1;

    return (
        <Card title="Inventory Flow" className="p-8 border-none shadow-xl glass">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Shipment Status Distribution</p>

            <div className="space-y-8">
                <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-100">
                    {data.map((item, idx) => (
                        <div
                            key={idx}
                            className={`h-full transition-all duration-1000 ${statusColors[item._id] || 'bg-slate-400'}`}
                            style={{ width: `${(item.count / total) * 100}%` }}
                            title={`${item._id}: ${item.count}`}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {data.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 group">
                            <div className={`w-3 h-3 rounded-md ${statusColors[item._id] || 'bg-slate-400'} group-hover:scale-125 transition-transform`} />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{item._id.replace('_', ' ')}</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-black text-slate-900">{item.count}</span>
                                    <span className="text-[10px] font-bold text-slate-400">{((item.count / total) * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default StatusDistribution;
