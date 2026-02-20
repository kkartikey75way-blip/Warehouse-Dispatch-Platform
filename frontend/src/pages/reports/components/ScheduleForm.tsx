import React from "react";

interface ScheduleFormProps {
    newSchedule: {
        name: string;
        type: "dispatch_manifest" | "delivery_report";
        format: "CSV" | "PDF";
        cronExpression: string;
        timezone: string;
        recipientEmails: string[];
    };
    onFieldChange: (field: string, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

const ScheduleForm = ({ newSchedule, onFieldChange, onSubmit, onCancel }: ScheduleFormProps) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6 relative z-10">
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Task Name</label>
                <input
                    type="text"
                    required
                    value={newSchedule.name}
                    onChange={e => onFieldChange("name", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="e.g. Daily Dispatch Audit"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Report Type</label>
                    <select
                        value={newSchedule.type}
                        onChange={e => onFieldChange("type", e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none transition-all"
                    >
                        <option value="dispatch_manifest">Manifest</option>
                        <option value="delivery_report">Delivery</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Format</label>
                    <select
                        value={newSchedule.format}
                        onChange={e => onFieldChange("format", e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none transition-all"
                    >
                        <option value="CSV">CSV</option>
                        <option value="PDF">PDF</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Cron Expression</label>
                <input
                    type="text"
                    required
                    value={newSchedule.cronExpression}
                    onChange={e => onFieldChange("cronExpression", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
            </div>
            <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Recipients (Email)</label>
                <input
                    type="text"
                    required
                    value={newSchedule.recipientEmails.join(", ")}
                    onChange={e => onFieldChange("recipientEmails", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="sep by comma"
                />
            </div>
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    Deploy Task
                </button>
            </div>
        </form>
    );
};

export default ScheduleForm;
