import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Info, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

const HealthScore = ({ score = 0, rank = "Top 5%", trend = "+2.4%" }) => {
    const [showMethodology, setShowMethodology] = useState(false);

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
                <button
                    onClick={() => setShowMethodology(true)}
                    title="Score Methodology"
                    className="p-2 rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-400 transition-colors"
                >
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

            <AnimatePresence>
                {showMethodology && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative flex flex-col z-[60]"
                        >
                            <button
                                onClick={() => setShowMethodology(false)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                    <Info className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Score Methodology</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 text-emerald-900">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shrink-0">90+</div>
                                    <div>
                                        <h4 className="font-black text-emerald-700">Healthy</h4>
                                        <p className="text-xs font-medium opacity-80 mt-1">Full compliance with regulatory standards. No outstanding critical alerts.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 text-amber-900">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0">70+</div>
                                    <div>
                                        <h4 className="font-black text-amber-700">Needs Attention</h4>
                                        <p className="text-xs font-medium opacity-80 mt-1">Minor infractions or upcoming deadlines detected. Action recommended.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50 text-rose-900">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black shrink-0">&lt;70</div>
                                    <div>
                                        <h4 className="font-black text-rose-700">At Risk</h4>
                                        <p className="text-xs font-medium opacity-80 mt-1">Severe violations, missing documentation, or expired certifications detected.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HealthScore;
