import React from 'react';

interface WaterfallStep {
    category: string;
    impact: number;
    description: string;
    shipmentCount: number;
}

interface WaterfallChartProps {
    baseline: number;
    current: number;
    steps: WaterfallStep[];
}

const WaterfallChart: React.FC<WaterfallChartProps> = ({ baseline, current, steps }) => {
    let runningTotal = baseline;

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative group">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Root Cause Analysis</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">SLA Waterfall Impact (Next 24h)</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Delta</p>
                    <p className="text-2xl font-black text-red-500">{(current - baseline).toFixed(1)}%</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Baseline */}
                <div className="flex items-center gap-4">
                    <div className="w-24 text-[10px] font-black text-slate-400 uppercase truncate">Baseline</div>
                    <div className="flex-1 h-8 bg-slate-50 rounded-lg relative overflow-hidden ring-1 ring-slate-100">
                        <div
                            className="h-full bg-slate-200 transition-all duration-1000"
                            style={{ width: `${baseline}%` }}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">
                            {baseline.toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Impact Steps */}
                {steps.map((step, idx) => {
                    const impactWidth = Math.abs(step.impact);
                    const prevTotal = runningTotal;
                    runningTotal += step.impact;

                    return (
                        <div key={idx} className="flex items-center gap-4 group/step">
                            <div className="w-24">
                                <p className="text-[10px] font-black text-slate-900 uppercase leading-tight">{step.category}</p>
                            </div>
                            <div className="flex-1 h-8 relative">
                                <div
                                    className={`absolute h-full rounded-lg transition-all duration-1000 delay-${idx * 100} shadow-sm`}
                                    style={{
                                        left: `${Math.min(prevTotal, runningTotal)}%`,
                                        width: `${impactWidth}%`,
                                        backgroundColor: step.impact < 0 ? '#ef4444' : '#10b981'
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                                    <span />
                                    <span className={`text-[10px] font-black ${step.impact < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {step.impact > 0 ? '+' : ''}{step.impact.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Current */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                    <div className="w-24 text-[10px] font-black text-slate-900 uppercase">Current</div>
                    <div className="flex-1 h-10 bg-slate-900 rounded-xl relative overflow-hidden shadow-lg ring-4 ring-slate-50">
                        <div
                            className="h-full bg-primary transition-all duration-1000 delay-500"
                            style={{ width: `${current}%` }}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-white">
                            {current.toFixed(1)}% SUCCESS RATE
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                {steps.slice(0, 2).map((s, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.category}</p>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed">{s.description}</p>
                    </div>
                ))}
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-red-500/10 transition-all duration-700" />
        </div>
    );
};

export default WaterfallChart;
