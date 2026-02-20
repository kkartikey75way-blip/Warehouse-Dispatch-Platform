import Card from "../../../components/Card";

interface PerformanceChartProps {
    title: string;
    data: Array<{ name: string; value: number }>;
}

const PerformanceChart = ({ title, data }: PerformanceChartProps) => {
    const maxVal = Math.max(...data.map(d => d.value), 10);
    const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.value / maxVal) * 80}`).join(" ");
    const areaPoints = `0,100 ${points} 100,100`;

    return (
        <Card className="p-8 border-none shadow-xl glass overflow-hidden relative group">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">7-Day Shipment Performance</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-black text-slate-500 uppercase">Volume</span>
                    </div>
                </div>
            </div>

            <div className="h-48 relative mt-4">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {}
                    {[0, 25, 50, 75, 100].map(val => (
                        <line key={val} x1="0" y1={val} x2="100" y2={val} stroke="#f1f5f9" strokeWidth="0.5" />
                    ))}

                    {}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <polyline points={areaPoints} fill="url(#chartGradient)" />

                    {}
                    <polyline
                        points={points}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {}
                    {data.map((d, i) => (
                        <circle
                            key={i}
                            cx={(i / (data.length - 1)) * 100}
                            cy={100 - (d.value / maxVal) * 80}
                            r="1.5"
                            fill="white"
                            stroke="var(--primary)"
                            strokeWidth="1.5"
                            className="transition-all duration-300 hover:r-3 cursor-pointer"
                        />
                    ))}
                </svg>
            </div>

            <div className="flex justify-between mt-6 relative z-10">
                {data.map((d, i) => (
                    <span key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {d.name.slice(0, 3)}
                    </span>
                ))}
            </div>
        </Card>
    );
};

export default PerformanceChart;
