import { useState } from "react";
import { useGetSchedulesQuery, useCreateScheduleMutation, useDeleteScheduleMutation, useRunReportNowMutation } from "../../services/schedulerApi";
import { Icons } from "../../components/Icons";
import Card from "../../components/Card";
import toast from "react-hot-toast";
import ScheduleList from "./components/ScheduleList";
import ScheduleForm from "./components/ScheduleForm";

const ReportsPage = () => {
    const { data: schedules, isLoading } = useGetSchedulesQuery();
    const [createSchedule] = useCreateScheduleMutation();
    const [deleteSchedule] = useDeleteScheduleMutation();
    const [runNow] = useRunReportNowMutation();

    const [isAdding, setIsAdding] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        name: "",
        type: "DISPATCH_MANIFEST" as "DISPATCH_MANIFEST" | "DELIVERY_REPORT",
        format: "CSV" as "CSV" | "PDF",
        cron: "0 0 * * *",
        recipients: [] as string[]
    });

    const handleFieldChange = (field: string, value: string) => {
        if (field === "recipients") {
            setNewSchedule(prev => ({ ...prev, recipients: value.split(",").map((r: string) => r.trim()).filter(Boolean) }));
        } else {
            setNewSchedule(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createSchedule(newSchedule).unwrap();
            toast.success("Schedule created successfully");
            setIsAdding(false);
            setNewSchedule({ name: "", type: "DISPATCH_MANIFEST", format: "CSV", cron: "0 0 * * *", recipients: [] });
        } catch {
            // Error handled globally by baseApi
        }
    };

    if (isLoading) return <div className="p-8 animate-pulse text-slate-400 font-black uppercase tracking-widest">Wiring Scheduler...</div>;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Automated Reporting</h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <Icons.Clock className="w-5 h-5 text-primary" />
                        Timezone-aware cron scheduling for operational exports
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Icons.Plus className="w-4 h-4" />
                    New Schedule
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Active Schedules" className="p-8 border-none shadow-xl glass transition-all">
                        <ScheduleList
                            schedules={schedules || []}
                            onRunNow={runNow}
                            onDelete={deleteSchedule}
                        />
                    </Card>
                </div>

                <div className="space-y-8">
                    {isAdding ? (
                        <Card title="Configure Schedule" className="p-8 border-none shadow-2xl bg-slate-900 text-white relative overflow-hidden">
                            <ScheduleForm
                                newSchedule={newSchedule}
                                onFieldChange={handleFieldChange}
                                onSubmit={handleCreate}
                                onCancel={() => setIsAdding(false)}
                            />
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none" />
                        </Card>
                    ) : (
                        <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-50 text-slate-200">
                                <Icons.Plus className="w-8 h-8" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Build Automation</p>
                            <p className="text-xs font-bold text-slate-500">Configure recurring reports that get emailed to your team automatically.</p>
                        </div>
                    )}

                    <Card className="p-8 border-none shadow-xl bg-slate-50/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Icons.Info className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">System Notification</h3>
                        </div>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                            Scheduled reports are generated asynchronously on the backend. Recipients will receive a signed, time-limited download link via email once the task completes.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
