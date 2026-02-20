import { Icons } from "../../../components/Icons";

const ReturnRoutingCard = () => {
    return (
        <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 mb-6">Optimizing return paths based on capacity & proximity.</p>
            <div className="space-y-6">
                <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                            <Icons.SwitchCamera className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black">Reverse Logistics Engine</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active & Monitoring</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Returns are automatically routed to the nearest node with available capacity {'>'} 30%. High-priority returns (Express) bypass capacity checks.
                    </p>
                </div>
                <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                    View Returns Dashboard
                </button>
            </div>
        </div>
    );
};

export default ReturnRoutingCard;
