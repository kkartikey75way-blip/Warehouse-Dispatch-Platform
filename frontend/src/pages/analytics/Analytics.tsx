import { useGetKpiDashboardQuery } from "../../services/analyticsApi";
import KpiCard from "./components/KpiCard";
import PerformanceChart from "./components/PerformanceChart";
import StatusDistribution from "./components/StatusDistribution";
import AnalyticsChart from "./components/AnalyticsChart";
import { Icons } from "../../components/Icons";
import Card from "../../components/Card";

const AnalyticsPage = () => {
    const { data: dashboard, isLoading, error } = useGetKpiDashboardQuery();

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-20 bg-slate-100/50 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100/50 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-80 bg-slate-100/50 rounded-3xl" />
                    <div className="h-80 bg-slate-100/50 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (error || !dashboard) {
        return (
            <div className="p-20 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/10">
                    <Icons.AlertCircle />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Analytics Unavailable</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                    We're having trouble connecting to the analytics engine. Please check your connection and try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 px-8 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
                        System Insights
                    </h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <Icons.Zap />
                        Real-time intelligence dashboard for WAREFLOW Operations
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <Icons.CheckCircle />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
                        <p className="text-sm font-black text-slate-900">
                            {dashboard?.onTimeRate > 0.9 ? 'HEALTHY / 100%' : 'DEGRADED / ACTION REQUIRED'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Success Rate"
                    value={`${(dashboard.onTimeRate * 100).toFixed(1)}%`}
                    description="Deliveries within SLA"
                    color="emerald"
                    trend="+2.4%"
                    trendType="positive"
                    icon={<Icons.CheckCircle />}
                />
                <KpiCard
                    title="Dispatch Latency"
                    value={`${dashboard.avgDispatchTime}m`}
                    description="Avg. sorting time"
                    color="blue"
                    trend="-12m"
                    trendType="positive"
                    icon={<Icons.Clock />}
                />
                <KpiCard
                    title="Today's Volume"
                    value={dashboard.todayShipments}
                    description="Processed shipments"
                    color="indigo"
                    trend="+18%"
                    trendType="positive"
                    icon={<Icons.Package />}
                />
                <KpiCard
                    title="Fleet Activity"
                    value={dashboard.activeDrivers}
                    description="Operational vehicles"
                    color="orange"
                    trend="+3"
                    trendType="positive"
                    icon={<Icons.Truck />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <PerformanceChart title="Volume Trends" data={dashboard.trends || []} />

                    <Card title="Operational Log" className="p-8 border-none shadow-xl glass">
                        <div className="space-y-6">
                            {dashboard.recentActivity && dashboard.recentActivity.length > 0 ? (
                                dashboard.recentActivity.slice(0, 5).map((activity, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-primary shadow-sm">
                                            <Icons.Zap />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-black text-slate-900">{activity.description}</p>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {activity.time}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                Automated Event • ID {Math.random().toString(36).substr(2, 6).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                                    Queue empty
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    <StatusDistribution data={dashboard.shipmentsByStatus || []} />

                    <AnalyticsChart title="Fleet Utilization" data={dashboard.driverUtilization || []} />

                    <Card className="p-8 border-none shadow-xl bg-slate-900 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black tracking-tight mb-2">Weekly Performance</h3>
                            <p className="text-slate-400 text-xs font-bold mb-6">Aggregate warehouse score based on volume and efficiency.</p>
                            <div className="text-5xl font-black mb-2 flex items-baseline gap-2">
                                {dashboard.performanceScore}
                                <span className="text-primary text-xl">/ 100</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-6">
                                <div className="h-full bg-primary shadow-lg shadow-primary/40" style={{ width: `${dashboard.performanceScore}%` }} />
                            </div>
                        </div>
                        {}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/30 transition-all duration-700" />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
