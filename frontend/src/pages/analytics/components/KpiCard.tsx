import Card from "../../../components/Card";

interface KpiCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ReactNode;
    color: string;
    trend?: string;
    trendType?: "positive" | "negative";
}

const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/5 text-emerald-600 ring-emerald-100 bg-emerald-50",
    blue: "bg-blue-500/5 text-blue-600 ring-blue-100 bg-blue-50",
    indigo: "bg-indigo-500/5 text-indigo-600 ring-indigo-100 bg-indigo-50",
    orange: "bg-orange-500/5 text-orange-600 ring-orange-100 bg-orange-50",
};

const KpiCard = ({ title, value, description, icon, color, trend, trendType }: KpiCardProps) => {
    const classes = colorMap[color] || colorMap.blue;

    return (
        <Card className="p-6 relative overflow-hidden group transition-all hover:shadow-2xl hover:-translate-y-1 border-none glass">
            {/* Background Decorative Blob */}
            <div className={`absolute right-0 top-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150 blur-3xl ${classes.split(' ')[0]}`} />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl shadow-sm ring-1 ${classes.split(' ').slice(1).join(' ')}`}>
                        {icon}
                    </div>
                    {trend && (
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trendType === "positive" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                            {trend}
                        </span>
                    )}
                </div>

                <div className="mt-auto">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                    {description && (
                        <p className="text-xs font-bold text-slate-500 mt-1 opacity-70">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default KpiCard;
