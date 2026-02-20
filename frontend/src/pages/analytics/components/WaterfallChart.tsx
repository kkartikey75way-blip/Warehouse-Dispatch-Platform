import React from 'react';
import { Icons } from '../../../components/Icons';

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

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-all duration-700 group-hover:bg-primary/10" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Root Cause Analysis</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">SLA Waterfall Impact (Next 24h)</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Delta</p>
                    <div className={`text-2xl font-black flex items-center gap-2 justify-end ${current >= baseline ? 'text-emerald-500' : 'text-red-500'}`}>
                        {current >= baseline ? <Icons.ArrowUp className="w-5 h-5" /> : <Icons.ArrowDown className="w-5 h-5" />}
                        {Math.abs(current - baseline).toFixed(1)}%
                    </div>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {/* Baseline */}
                <div className="flex items-center gap-4">
                    <div className="w-32 text-[10px] font-black text-slate-400 uppercase truncate">Operational Baseline</div>
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
                {steps.reduce((acc, step, idx) => {
                    const prevTotal = idx === 0 ? baseline : acc[idx - 1].currentTotal;
                    const currentTotal = prevTotal + step.impact;
                    acc.push({ ...step, prevTotal, currentTotal });
                    return acc;
                }, [] as Array<WaterfallStep & { prevTotal: number; currentTotal: number }>).map((step, idx) => {
                    const impactWidth = Math.abs(step.impact);

                    return (
                        <div key={idx} className="flex items-center gap-4 group/step relative">
                            <div className="w-32">
                                <p className="text-[10px] font-black text-slate-900 uppercase leading-tight">{step.category}</p>
                            </div>
                            <div className="flex-1 h-8 relative">
                                <div
                                    className={`absolute h-full rounded-lg transition-all duration-1000 delay-${idx * 100} shadow-sm cursor-help`}
                                    style={{
                                        left: `${Math.min(step.prevTotal, step.currentTotal)}%`,
                                        width: `${impactWidth}%`,
                                        backgroundColor: step.impact < 0 ? '#ef4444' : '#10b981'
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                                    <span />
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${step.impact < 0 ? 'text-red-600 bg-red-50/50' : 'text-emerald-600 bg-emerald-50/50'}`}>
                                        {step.impact > 0 ? '+' : ''}{step.impact.toFixed(1)}%
                                    </span>
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl opacity-0 invisible group-hover/step:opacity-100 group-hover/step:visible transition-all duration-200 z-50 pointer-events-none translate-y-2 group-hover/step:translate-y-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">{step.category}</p>
                                        <div className="px-2 py-0.5 rounded bg-white/10 text-[8px] font-black">
                                            {step.shipmentCount} UNITS
                                        </div>
                                    </div>
                                    <p className="text-[10px] leading-relaxed font-medium text-slate-300">
                                        {step.description}
                                    </p>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                        <div className="border-8 border-transparent border-t-slate-900" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Current */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                    <div className="w-32 text-[10px] font-black text-slate-900 uppercase">Projected End-of-Day</div>
                    <div className="flex-1 h-12 bg-slate-900 rounded-xl relative overflow-hidden shadow-lg ring-4 ring-slate-50">
                        <div
                            className="h-full bg-primary transition-all duration-1000 delay-500"
                            style={{ width: `${current}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-4">
                            <span className="text-xs font-black text-white tracking-widest">
                                {current.toFixed(1)}% SUCCESS RATE
                            </span>
                            <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">SLA-GRADE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all cursor-default">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Risk</p>
                    </div>
                    {steps.find(s => s.impact < 0) ? (
                        <p className="text-xs font-bold text-slate-700 leading-snug">
                            {steps.sort((a, b) => a.impact - b.impact)[0].category}: {steps.sort((a, b) => a.impact - b.impact)[0].description}
                        </p>
                    ) : (
                        <p className="text-xs font-bold text-slate-400 italic">No significant risks identified</p>
                    )}
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all cursor-default">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Gain</p>
                    </div>
                    {steps.find(s => s.impact > 0) ? (
                        <p className="text-xs font-bold text-slate-700 leading-snug">
                            {steps.sort((a, b) => b.impact - a.impact)[0].category}: {steps.sort((a, b) => b.impact - a.impact)[0].description}
                        </p>
                    ) : (
                        <p className="text-xs font-bold text-slate-400 italic">No significant gains identified</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WaterfallChart;
