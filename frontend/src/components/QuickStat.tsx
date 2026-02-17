
interface QuickStatProps {
    label: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
}

const QuickStat = ({ label, value, icon: Icon, color }: QuickStatProps) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 backdrop-blur-xl border border-white shadow-sm">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white shadow-lg shadow-current/20`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
        </div>
    </div>
);

export default QuickStat;
