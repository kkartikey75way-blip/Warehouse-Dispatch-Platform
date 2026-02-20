import { Icons } from "../../../components/Icons";
import { type Conflict } from "../../../types";

interface ConflictListProps {
    conflicts: Conflict[];
    onReconcile: (id: string) => void;
}

const ConflictList = ({ conflicts, onReconcile }: ConflictListProps) => {
    return (
        <div className="space-y-4">
            {conflicts.map((c, idx) => (
                <div key={idx} className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                            <Icons.AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">{c.type}</p>
                            <p className="text-xs font-bold text-amber-900">{c.description}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onReconcile(c.id)}
                        className="px-4 py-2 bg-white text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-md transition-all border border-amber-100"
                    >
                        Reconcile
                    </button>
                </div>
            ))}
            {conflicts.length === 0 && (
                <div className="py-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Global state synchronized
                </div>
            )}
        </div>
    );
};

export default ConflictList;
