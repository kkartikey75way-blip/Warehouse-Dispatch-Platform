import { useGetKpiDashboardQuery } from "../../services/analyticsApi";
import Card from "../../components/Card";

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

const DashboardPage = () => {
    const { data, isLoading } = useGetKpiDashboardQuery();

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
                        {!data?.recentActivity || data.recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                                </div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No recent activity detected</p>
                            </div>
                        ) : (
                            data.recentActivity.map((activity, idx) => (
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
                            ))
                        )}
                    </div>
                </Card>

                <Card title="Fleet Status">
                    <div className="space-y-6">
                        {data?.driverUtilization?.map((driver, idx) => (
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
        </div>
    );
};

export default DashboardPage;
