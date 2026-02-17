import { useEffect } from "react";
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllAsReadMutation } from "../../services/notificationApi";
import Card from "../../components/Card";
import { Icons } from "../../components/IconRegistry";

const NotificationsPage = () => {
    const { data: notifications, isLoading } = useGetNotificationsQuery();
    const [markRead] = useMarkNotificationReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();

    useEffect(() => {
        const unreadNotifications = notifications?.filter(n => !n.read);
        if (unreadNotifications && unreadNotifications.length > 0) {
            markAllAsRead();
        }
    }, [notifications, markAllAsRead]);

    const handleMarkRead = async (id: string) => {
        try {
            await markRead(id).unwrap();
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'ALERT': return 'bg-red-500 shadow-red-200';
            case 'SUCCESS': return 'bg-emerald-500 shadow-emerald-200';
            case 'INFO': return 'bg-blue-500 shadow-blue-200';
            default: return 'bg-slate-500 shadow-slate-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'ALERT': return <Icons.AlertCircle className="w-5 h-5" />;
            case 'SUCCESS': return <Icons.CheckCircle className="w-5 h-5" />;
            default: return <Icons.Info className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-12 max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Operational Alerts</h1>
                    <p className="text-slate-500 font-medium">Real-time system telemetry and dispatch updates</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Monitoring</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-3xl bg-white shadow-sm animate-pulse glass" />)
                ) : notifications?.length === 0 ? (
                    <Card className="p-24 text-center flex flex-col items-center justify-center border-none shadow-2xl shadow-slate-200/50 glass">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                            <Icons.BellOff className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Systems Nominal</h3>
                        <p className="text-xs text-slate-400 font-medium">No active alerts requiring attention</p>
                    </Card>
                ) : (
                    notifications?.map((notif) => (
                        <Card
                            key={notif._id}
                            className={`group relative p-8 border-none transition-all duration-500 glass hover:-translate-y-1 hover:shadow-3xl ${notif.read ? 'opacity-50 grayscale hover:grayscale-0' : 'shadow-2xl shadow-slate-200/50'}`}
                        >
                            <div className="flex gap-8 items-start">
                                <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:rotate-6 ${getTypeColor(notif.type)}`}>
                                    {getTypeIcon(notif.type)}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight">{notif.title}</h4>
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">{notif.message}</p>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap pt-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {!notif.read && (
                                        <div className="pt-4 flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest underline decoration-2 underline-offset-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleMarkRead(notif._id)}>
                                                    Dismiss Alert
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!notif.read && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
