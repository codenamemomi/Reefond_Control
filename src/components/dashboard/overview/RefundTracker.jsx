import React from 'react';
import { DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

const RefundTracker = ({ metrics = null }) => {
    const refunds = metrics && metrics.recent_activity ? metrics.recent_activity.slice(0, 2).map(r => ({
        id: r.case_number || (r.id ? r.id.substring(0, 8) : 'Pending'),
        taxpayer: r.taxpayer_name,
        status: r.status,
        amount: `₦${Number(r.amount_claimed || 0).toLocaleString()}`,
        icon: r.status === 'disbursed' ? CheckCircle2 : Clock,
        type: r.status === 'disbursed' ? 'success' : 'warning'
    })) : [];

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Refund Monitoring</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Cashback & Recovery</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-ree-green/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-ree-green" />
                </div>
            </div>

            <div className="space-y-4 flex-1">
                {refunds.map((refund) => (
                    <div
                        key={refund.id}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-ree-green/20 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-ree-green uppercase tracking-widest">{refund.taxpayer}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case {refund.id}</span>
                            </div>
                            <div className={clsx(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                refund.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            )}>
                                {refund.status}
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <p className="text-2xl font-black text-slate-900 tracking-tight">{refund.amount}</p>
                            <button className="p-2 rounded-xl text-slate-300 hover:text-ree-green transition-colors">
                                <refund.icon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                Initiate New Refund
            </button>
        </div >
    );
};

export default RefundTracker;
