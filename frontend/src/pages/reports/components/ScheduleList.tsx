import { Icons } from "../../../components/Icons";
import { type Schedule } from "../../../services/schedulerApi";

interface ScheduleListProps {
    schedules: Schedule[];
    onRunNow: (id: string) => void;
    onDelete: (id: string) => void;
}

const ScheduleList = ({ schedules, onRunNow, onDelete }: ScheduleListProps) => {
    return (
        <div className="space-y-4">
            {schedules?.map((s) => (
                <div key={s._id} className="p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-lg transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary border border-slate-100">
                                <Icons.Download className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900">{s.name}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.type} • {s.format}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                onClick={() => onRunNow(s._id)}
                                className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors"
                                title="Run Now"
                            >
                                <Icons.Zap className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onDelete(s._id)}
                                className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                                title="Delete"
                            >
                                <Icons.X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Frequency</p>
                            <p className="text-[10px] font-bold text-slate-700 font-mono bg-slate-50 px-2 py-0.5 rounded inline-block">{s.cron}</p>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Sync</p>
                            <p className="text-[10px] font-bold text-slate-700">{s.lastRun ? new Date(s.lastRun).toLocaleString() : 'Never'}</p>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${s.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {s.active ? 'Operational' : 'Paused'}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            {(!schedules || schedules.length === 0) && (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <Icons.Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No scheduled tasks</p>
                </div>
            )}
        </div>
    );
};

export default ScheduleList;
