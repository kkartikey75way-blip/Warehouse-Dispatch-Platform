import Card from "../../../components/Card";

interface AnalyticsDataPoint {
    name?: string;
    type?: string;
    utilization?: number;
    deliveries?: number;
}

interface AnalyticsChartProps {
    title: string;
    data: AnalyticsDataPoint[];
}

const AnalyticsChart = ({ title, data }: AnalyticsChartProps) => {

    return (
        <Card className="p-10 space-y-10 border-none shadow-2xl shadow-slate-200/50 glass overflow-hidden relative group">
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-primary/10" />

            <div className="flex items-center justify-between relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Fleet Performance</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/30" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Utilization %</span>
                    </div>
                </div>
            </div>

            <div className="h-72 relative pt-8">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pt-8 pb-12 pointer-events-none opacity-40">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-full h-px bg-slate-100 border-t border-dashed border-slate-200" />
                    ))}
                </div>

                <div className="relative h-full flex items-end justify-between gap-6 px-2">
                    {data.map((item, idx) => {
                        const val = item.utilization ?? item.deliveries ?? 0;
                        const height = Math.max(val, 5); // Minimum height for visibility

                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-4 group/bar relative h-full">
                                <div className="w-full flex-1 flex flex-col justify-end">
                                    <div className="w-full relative group/tool">
                                        <div
                                            className="w-full bg-gradient-to-t from-indigo-600 via-primary to-blue-400 rounded-t-2xl shadow-2xl shadow-primary/20 transition-all duration-700 ease-out group-hover/bar:scale-x-105 group-hover/bar:brightness-110 relative"
                                            style={{ height: `${height}%` }}
                                        >
                                            {/* Glossy overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-t-2xl" />

                                            {/* Hover Tooltip */}
                                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none scale-90 group-hover/bar:scale-100 z-30">
                                                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl relative">
                                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Current Load</p>
                                                    <p className="text-sm font-black text-center">{val}%</p>
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full h-12 flex items-center justify-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate text-center group-hover/bar:text-slate-900 transition-colors duration-300">
                                        {item.name || item.type || `ID ${idx + 1}`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};

export default AnalyticsChart;
