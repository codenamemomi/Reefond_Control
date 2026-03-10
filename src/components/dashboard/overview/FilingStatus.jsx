import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

const FilingStatus = ({ data = {} }) => {
    const filings = [
        { name: 'PAYE Status', status: data.PAYE || 'N/A', type: data.PAYE === 'overdue' ? 'warning' : 'success', icon: data.PAYE === 'overdue' ? AlertCircle : CheckCircle2 },
        { name: 'VAT Status', status: data.VAT || 'N/A', type: data.VAT === 'overdue' ? 'warning' : 'success', icon: data.VAT === 'overdue' ? AlertCircle : CheckCircle2 },
        { name: 'Corporate Income Tax', status: data.CIT || 'N/A', type: data.CIT === 'overdue' ? 'warning' : 'success', icon: data.CIT === 'overdue' ? AlertCircle : CheckCircle2 },
        { name: 'Withholding Tax', status: data.WHT || 'N/A', type: data.WHT === 'overdue' ? 'warning' : 'success', icon: data.WHT === 'overdue' ? AlertCircle : CheckCircle2 },
    ];

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Filing Status Overview</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Regulatory Obligations</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-slate-400" />
                </div>
            </div>

            <div className="space-y-4">
                {filings.map((filing, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:border-ree-green/20 transition-all group"
                    >
                        <span className="text-sm font-bold text-slate-700">{filing.name}</span>
                        <div className={clsx(
                            "flex items-center gap-2 font-black text-[10px] uppercase tracking-wider",
                            filing.type === 'success' ? "text-emerald-500" : "text-amber-500"
                        )}>
                            <filing.icon className="w-4 h-4" />
                            {filing.status}
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-8 text-xs font-black text-ree-green uppercase tracking-[0.2em] hover:text-ree-light transition-colors flex items-center gap-2 group">
                Full Compliance Audit
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
        </div>
    );
};

export default FilingStatus;
