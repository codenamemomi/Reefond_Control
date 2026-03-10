import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Info } from 'lucide-react';
import { clsx } from 'clsx';

const HealthScore = ({ score = 0, rank = "Top 5%", trend = "+2.4%" }) => {
    const getColor = (s) => {
        if (s >= 90) return 'text-emerald-500';
        if (s >= 70) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getBgColor = (s) => {
        if (s >= 90) return 'bg-emerald-500';
        if (s >= 70) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    const getStatus = (s) => {
        if (s >= 90) return 'Healthy';
        if (s >= 70) return 'Needs Attention';
        return 'At Risk';
    };

    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-6 right-6">
                <button title="Score Methodology" className="p-2 rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-400 transition-colors">
                    <Info className="w-5 h-5" />
                </button>
            </div>

            <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        className="text-slate-50"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="40" cx="50" cy="50"
                    />
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={getColor(score)}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl font-black text-slate-900 tracking-tighter"
                    >
                        {score > 0 ? Math.round(score) : '--'}
                    </motion.span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{score > 0 ? '/ 100' : 'No Data'}</span>
                </div>
            </div>

            <div className="text-center space-y-2">
                <div className={clsx(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    score >= 90 ? "bg-emerald-50 text-emerald-600" : score >= 70 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                )}>
                    <div className={clsx("w-1.5 h-1.5 rounded-full", getBgColor(score))} />
                    {getStatus(score)}
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Compliance Health</h3>
                <p className="text-xs text-slate-500 font-medium max-w-[200px] leading-relaxed">
                    Your core signature indicator based on live regulatory vectors.
                </p>
            </div>

            <div className="mt-6 w-full pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rank</p>
                    <p className="text-sm font-black text-slate-900">{rank}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trend</p>
                    <p className={clsx(
                        "text-sm font-black italic",
                        trend?.startsWith('+') ? "text-emerald-500" : "text-rose-500"
                    )}>{trend}</p>
                </div>
            </div>
        </div>
    );
};

export default HealthScore;
