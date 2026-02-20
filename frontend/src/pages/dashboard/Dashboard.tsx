import { useMemo } from "react";
import { useGetKpiDashboardQuery } from "../../services/analyticsApi";
import Card from "../../components/Card";
import { Icons } from "../../components/Icons";
import { type RecentActivity as Activity, type CausalWaterfall as CausalAnalysis, type DriverUtilization } from "../../types";

interface StatCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    trend: string;
    trendType: 'positive' | 'negative';
}

const StatCard = ({ title, value, subValue, trend, trendType }: StatCardProps) => (
    <Card className="flex flex-col gap-1 relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 mt-1">{value}</h3>
        <div className="flex items-center gap-2 mt-4">
            <span className={`text-xs font-black px-2 py-0.5 rounded-md ${trendType === "positive" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                {trend}
            </span>
            <span className="text-xs font-bold text-slate-400">{subValue}</span>
        </div>
    </Card>
);

const CausalWaterfall = ({ analysis }: { analysis: CausalAnalysis }) => (
    <Card title="Performance Causal Analysis" className="col-span-1 lg:col-span-3">
        <div className="mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Performance Driver</p>
                <h4 className="text-xl font-black text-slate-900">{analysis.primaryCause}</h4>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Baseline vs Current</p>
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-400 line-through">{analysis.baselineOnTimeRate}%</span>
                    <Icons.ArrowRight className="w-4 h-4 text-slate-300" />
                    <span className="text-2xl font-black text-red-600">{analysis.currentOnTimeRate}%</span>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            {analysis.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-4">
                    <div className="w-48 text-xs font-black text-slate-500 uppercase tracking-tight truncate">{step.category}</div>
                    <div className="flex-1 h-8 flex items-center">
                        <div className="relative w-full h-full flex items-center">
                            { }
                            <div
                                className={`h-6 rounded-md flex items-center justify-end px-3 text-[10px] font-black text-white ${step.impact < 0 ? 'bg-red-500 shadow-sm shadow-red-200' : 'bg-green-500'}`}
                                style={{
                                    width: `${Math.abs(step.impact * 2)}%`,
                                    marginLeft: step.impact < 0 ? `${50 - Math.abs(step.impact * 2)}%` : '50%'
                                }}
                            >
                                {step.impact > 0 ? '+' : ''}{step.impact}%
                            </div>
                        </div>
                    </div>
                    <div className="w-64 text-[11px] text-slate-400 font-bold italic line-clamp-1">{step.description}</div>
                </div>
            ))}

            <div className="pt-4 border-t border-dashed border-slate-200 flex items-center justify-between">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Performance Delta</div>
                <div className="text-lg font-black text-red-600">{analysis.totalDelta}% OTD Drop</div>
            </div>
        </div>
    </Card>
);

const DashboardPage = () => {
    const { data, isLoading } = useGetKpiDashboardQuery();

    const memoizedActivity = useMemo(() => {
        if (!data?.recentActivity || data.recentActivity.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                        <Icons.Package className="w-8 h-8" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No recent activity detected</p>
                </div>
            );
        }
        return data.recentActivity.map((activity: Activity, idx: number) => (
            <div key={idx} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 font-bold uppercase">
                        {activity.description?.[0] || 'A'}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">{activity.description}</p>
                        <p className="text-xs text-slate-400 font-medium">{activity.time}</p>
                    </div>
                </div>
                <span className="text-xs font-black text-primary px-3 py-1 bg-primary/5 rounded-full tracking-tight">
                    COMPLETED
                </span>
            </div>
        ));
    }, [data?.recentActivity]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-40 bg-white rounded-2xl shadow-sm border border-slate-100" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Platform Overview</h1>
                <p className="text-slate-500 font-medium">Real-time logistics and warehouse performance metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Shipments"
                    value={data?.totalShipments || 0}
                    trend="+12%"
                    trendType="positive"
                    subValue="vs last month"
                />
                <StatCard
                    title="Dispatched Today"
                    value={data?.dispatchedToday || 0}
                    trend="+5.2%"
                    trendType="positive"
                    subValue="vs yesterday"
                />
                <StatCard
                    title="Delivered Successfully"
                    value={data?.deliveredToday || 0}
                    trend="-2.1%"
                    trendType="negative"
                    subValue="vs yesterday"
                />
                <StatCard
                    title="Active Drivers"
                    value={data?.activeDrivers || 0}
                    trend="+3"
                    trendType="positive"
                    subValue="Currently on shift"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 min-h-[400px]" title="Recent Dispatch Activity">
                    <div className="flex flex-col divide-y divide-slate-50">
                        {memoizedActivity}
                    </div>
                </Card>

                <Card title="Fleet Status">
                    <div className="space-y-6">
                        {data?.driverUtilization?.map((driver: DriverUtilization, idx: number) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-tight">
                                    <span className="text-slate-500">{driver.name}</span>
                                    <span className="text-slate-800">{driver.utilization}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000 ease-out shadow-sm shadow-primary/20"
                                        style={{ width: `${driver.utilization}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {data?.causalAnalysis && (
                <div className="grid grid-cols-1 gap-8">
                    <CausalWaterfall analysis={data.causalAnalysis} />
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
