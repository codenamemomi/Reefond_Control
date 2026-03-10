import React from 'react';
import { AlertTriangle, ShieldAlert, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

const RiskIndicators = ({ dashboard = null }) => {
    const riskLevel = dashboard?.summary?.system_risk_level || 'Medium';
    const risks = dashboard && dashboard.top_concerns ? dashboard.top_concerns.map(c => c.name || c.description) : [];

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col h-full relative overflow-hidden">
            {/* Risk Alert Overlay */}
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldAlert className="w-32 h-32 text-rose-500" />
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Compliance Risk</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Predictive Insights</p>
                </div>
                <div className={clsx(
                    "px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.1em] border-2",
                    riskLevel === 'Low' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                        riskLevel === 'Medium' ? "bg-amber-50 border-amber-100 text-amber-600" :
                            "bg-rose-50 border-rose-100 text-rose-600"
                )}>
                    {riskLevel} Risk
                </div>
            </div>

            <div className="space-y-4 flex-1 relative z-10">
                <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-4">
                    <TrendingDown className="w-6 h-6 text-rose-500 shrink-0 mt-1" />
                    <div className="space-y-2">
                        <p className="text-sm font-black text-slate-900">Potential Issues Flagged</p>
                        <ul className="space-y-1.5">
                            {risks.map((risk, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                    <div className="w-1 h-1 rounded-full bg-rose-400" />
                                    {risk}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <button className="mt-8 w-full py-4 border-2 border-slate-100 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 relative z-10">
                Run Diagnostic Scan
            </button>
        </div>
    );
};

export default RiskIndicators;
