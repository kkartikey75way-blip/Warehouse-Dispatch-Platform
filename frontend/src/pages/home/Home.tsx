import { useGetKpiDashboardQuery } from "../../services/analyticsApi";
import { useAppSelector } from "../../store/hooks";
import { Link } from "react-router-dom";
import Card from "../../components/Card";
import { Icons } from "../../components/Icons";
import DriverHome from "./DriverHome";

const HomePage = () => {
    const { user } = useAppSelector((state) => state.auth);
    const { data: dashboardData, isLoading } = useGetKpiDashboardQuery(undefined, {
        skip: user?.role === 'DRIVER'
    });

    if (user?.role === 'DRIVER') {
        return <DriverHome user={user} />;
    }

    const modules = [
        {
            to: "/shipments",
            title: "Shipment Tracking",
            description: "Manage inbound and outbound inventory with real-time status updates and tracking.",
            icon: Icons.Package,
            color: "from-blue-500 to-cyan-500",
            shadow: "shadow-blue-500/20"
        },
        {
            to: "/dispatch",
            title: "Fleet Dispatch",
            description: "Optimize driver assignments and monitor vehicle routes for maximum efficiency.",
            icon: Icons.Truck,
            color: "from-indigo-500 to-purple-500",
            shadow: "shadow-indigo-500/20"
        },
        {
            to: "/deliveries",
            title: "Last-Mile Delivery",
            description: "Track final delivery statuses and collect digital proof of delivery instantly.",
            icon: Icons.Dashboard,
            color: "from-emerald-500 to-teal-500",
            shadow: "shadow-emerald-500/20"
        },
        {
            to: "/drivers",
            title: "Driver Network",
            description: "Manage your personnel, track performance, and monitor fleet utilization.",
            icon: Icons.Truck,
            color: "from-amber-500 to-orange-500",
            shadow: "shadow-amber-500/20"
        }
    ];

    if (isLoading) {
        return (
            <div className="space-y-12 animate-pulse p-4">
                <div className="h-96 bg-txt-main/5 rounded-[3rem]" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-txt-main/5 rounded-[2.5rem]" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-24">
            {}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-950 p-12 md:p-16 text-white group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)]">
                {}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,oklch(0.6_0.18_250/_0.15),transparent_50%)]" />
                <div className="absolute -right-20 -top-20 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[140px] opacity-40 group-hover:opacity-60 transition-all duration-1000" />
                <div className="absolute left-1/4 -bottom-40 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />

                {}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-12 shadow-2xl">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                            v2.5 Enterprise Intel
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[0.95] mb-8 text-white">
                        Orchestrate <br />
                        <span className="text-gradient">Fluid Logistics</span>
                    </h1>

                    <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12 max-w-xl opacity-90">
                        The definitive operating system for high-velocity warehouses. Unified tracking, predictive routing, and autonomous dispatching.
                    </p>

                    <div className="flex flex-wrap gap-12 pt-8 border-t border-white/5">
                        <div className="flex flex-col gap-2">
                            <span className="text-4xl font-black tabular-nums tracking-tighter">{dashboardData?.totalShipments || 0}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Assets</span>
                        </div>
                        <div className="w-px h-16 bg-white/10 hidden md:block" />
                        <div className="flex flex-col gap-2">
                            <span className="text-4xl font-black tabular-nums tracking-tighter">{dashboardData?.activeDrivers || 0}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Fleet Capacity</span>
                        </div>
                        <div className="w-px h-16 bg-white/10 hidden md:block" />
                        <div className="flex flex-col gap-2">
                            <span className="text-4xl font-black tabular-nums tracking-tighter text-emerald-400">{dashboardData?.deliveredToday || 0}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Daily Throughput</span>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <section className="space-y-12">
                <div className="flex items-end justify-between px-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-1 bg-primary rounded-full" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Module Center</span>
                        </div>
                        <h2 className="text-5xl font-black text-txt-main tracking-tight">System Modules</h2>
                    </div>
                    <Link
                        to="/analytics"
                        className="group flex items-center gap-4 bg-txt-main text-surface px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-2xl hover:-translate-y-1"
                    >
                        Intelligence Suite
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {modules.map((module, idx) => (
                        <Card
                            key={idx}
                            className="group relative p-8 border-none shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-3 transition-all duration-700 glass overflow-hidden flex flex-col min-h-[320px]"
                        >
                            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-[60px] opacity-10 group-hover:opacity-30 transition-all duration-1000 bg-gradient-to-br ${module.color}`} />

                            <div className={`w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${module.color} ${module.shadow} flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                <module.icon className="w-7 h-7" />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-black text-txt-main mb-3 tracking-tight group-hover:text-primary transition-colors">{module.title}</h3>
                                <p className="text-sm text-txt-muted font-medium leading-relaxed mb-8 opacity-80">{module.description}</p>
                            </div>

                            <Link
                                to={module.to}
                                className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary group/link"
                            >
                                <span className="relative">
                                    Access Gateway
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover/link:w-full" />
                                </span>
                                <svg className="w-3.5 h-3.5 group-hover/link:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 p-2">
                <Card className="lg:col-span-2 p-10 border-none shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1)] glass relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Live Stream</span>
                            </div>
                            <h3 className="text-2xl font-black text-txt-main tracking-tight">Throughput Engine</h3>
                        </div>
                        <button className="px-5 py-2.5 rounded-xl bg-txt-main/5 text-[10px] font-black uppercase tracking-widest text-txt-muted hover:bg-primary hover:text-white transition-all">
                            Full Analytics
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
                        {dashboardData?.shipmentsByStatus?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="space-y-6 group/stat">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] opacity-60 group-hover/stat:opacity-100 transition-opacity">{item._id}</p>
                                        <p className="text-4xl font-black text-txt-main tabular-nums group-hover/stat:text-primary transition-colors">{item.count}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full ring-1 ring-emerald-500/20">
                                            +14.2%
                                        </div>
                                    </div>
                                </div>
                                <div className="relative h-2.5 w-full bg-txt-main/5 rounded-full overflow-hidden p-[2px] ring-1 ring-txt-main/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary via-indigo-500 to-blue-500 rounded-full transition-all duration-[1500ms] shadow-[0_0_15px_oklch(0.6_0.18_250/_0.4)]"
                                        style={{ width: `${Math.min((item.count / (dashboardData.totalShipments || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                </Card>

                <Card className="bg-slate-950 p-10 border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] text-white relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-[120px] -mr-32 -mt-32" />
                    <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" />

                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Performance Leaderboard</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-3 text-white">Top Fleet</h3>
                        <p className="text-xs text-slate-400 font-medium mb-12">Elite driver utilization metrics</p>

                        <div className="space-y-10">
                            {dashboardData?.driverUtilization?.slice(0, 4).map((driver, idx) => (
                                <div key={idx} className="space-y-4 group/driver">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span className="text-slate-200 group-hover/driver:text-primary transition-colors">{driver.name}</span>
                                        <span className="text-primary tabular-nums text-sm font-black">{driver.utilization}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full shadow-[0_0_10px_oklch(0.6_0.18_250/_0.3)] transition-all duration-1000"
                                            style={{ width: `${driver.utilization}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Link
                        to="/drivers"
                        className="text-white relative z-10 w-full mt-12 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-[1.25rem] hover:bg-white hover:text-slate-950 transition-all duration-500 text-center shadow-2xl"
                    >
                        Optimize Network
                    </Link>
                </Card>
            </div>
        </div>
    );
};

export default HomePage;
