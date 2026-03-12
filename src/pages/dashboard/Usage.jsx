import React, { useState, useEffect } from 'react';
import {
    Activity, Zap, Database, Server,
    ArrowUpRight, AlertCircle, Loader2, Gauge
} from 'lucide-react';
import { billingService } from '../../api/billing';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const Usage = () => {
    const [billing, setBilling] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        loadUsageData();
    }, []);

    const loadUsageData = async () => {
        if (!user.organization_id) {
            setError("No organization linked to interpret usage.");
            setLoading(false);
            return;
        }

        try {
            const data = await billingService.getOrganizationBilling(user.organization_id);
            setBilling(data);
        } catch (err) {
            console.error('Failed to load usage limits', err);
            setError(err.response?.data?.detail || "Failed to establish infrastructure connection.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-32 flex flex-col items-center gap-6">
                <Loader2 className="w-16 h-16 text-ree-green animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Scanning Platform Throughput...</p>
            </div>
        );
    }

    if (error && !billing) {
        return (
            <div className="p-32 flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2">
                    <Gauge className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{error}</h3>
                <button onClick={loadUsageData} className="text-ree-green font-bold hover:underline">Retry Connection</button>
            </div>
        );
    }

    const limits = billing?.usage_limits || { max_taxpayers: 50, max_filings_per_month: 200, max_users: 5, api_rate_limit: 1000 };
    const usage = billing?.current_usage || { taxpayers_count: 0, filings_count: 0, api_requests: 0, storage_used_mb: 0 };
    const period = usage?.period || 'Current Cycle';

    // Calculation Helpers
    const calcPct = (used, max) => Math.min(100, Math.max(0, (used / max) * 100)) || 0;
    const isWarn = (pct) => pct >= 80;
    const isMax = (pct) => pct >= 95;

    const cards = [
        {
            title: 'Taxpayer Profiles',
            icon: Activity,
            used: usage.taxpayers_count,
            max: limits.max_taxpayers,
            unit: 'entities',
            pct: calcPct(usage.taxpayers_count, limits.max_taxpayers)
        },
        {
            title: 'Monthly Filings',
            icon: Zap,
            used: usage.filings_count,
            max: limits.max_filings_per_month,
            unit: 'submissions',
            pct: calcPct(usage.filings_count, limits.max_filings_per_month)
        },
        {
            title: 'API Rate Throttle',
            icon: Server,
            used: usage.api_requests,
            max: limits.api_rate_limit,
            unit: 'requests/min',
            pct: calcPct(usage.api_requests, limits.api_rate_limit)
        },
        {
            title: 'Cloud Storage',
            icon: Database,
            used: usage.storage_used_mb,
            // Mocking storage limit if endpoint lacks it
            max: limits.max_storage_mb || 5000,
            unit: 'MB',
            pct: calcPct(usage.storage_used_mb, limits.max_storage_mb || 5000)
        }
    ];

    return (
        <div className="space-y-10 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Platform Engine Usage</h1>
                    <p className="text-slate-500 font-medium">Monitor your instance throughput ({period}) and quota limitations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2 active:scale-95">
                        <ArrowUpRight className="w-4 h-4" />
                        Upgrade Capacity Array
                    </button>
                </div>
            </div>

            {/* Quota Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col group relative overflow-hidden">

                        {isWarn(card.pct) && !isMax(card.pct) && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
                        )}
                        {isMax(card.pct) && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse" />
                        )}

                        <div className="flex items-start justify-between mb-8">
                            <div className={clsx(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                isMax(card.pct) ? "bg-rose-50 text-rose-500" : isWarn(card.pct) ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-500 group-hover:bg-slate-900 group-hover:text-white"
                            )}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <div className={clsx(
                                "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
                                isMax(card.pct) ? "bg-rose-50 text-rose-500 border-rose-200" : isWarn(card.pct) ? "bg-amber-50 text-amber-500 border-amber-200" : "bg-emerald-50 border-emerald-200 text-emerald-600"
                            )}>
                                {card.pct.toFixed(0)}%
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">{card.title}</h3>
                            <div className="flex items-end gap-1 mt-2">
                                <span className={clsx("text-3xl font-black tracking-tighter leading-none", isMax(card.pct) ? "text-rose-500" : "text-slate-900")}>
                                    {(card.used || 0).toLocaleString()}
                                </span>
                                <span className="text-xs font-bold text-slate-400 mb-1">/ {(card.max || 0).toLocaleString()} {card.unit}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-8">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${card.pct}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className={clsx(
                                        "h-full rounded-full transition-colors duration-500",
                                        isMax(card.pct) ? "bg-rose-500" : isWarn(card.pct) ? "bg-amber-400" : "bg-slate-900 group-hover:bg-ree-green"
                                    )}
                                />
                            </div>
                        </div>

                        {isMax(card.pct) && (
                            <div className="mt-4 flex flex-col gap-1 items-start">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                    <AlertCircle className="w-3 h-3" /> Limitation breached
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* System Status Banner */}
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-900/10">
                <div className="flex items-center gap-6">
                    <div className="relative flex items-center justify-center shrink-0">
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
                        <div className="relative w-12 h-12 bg-emerald-500 bg-opacity-20 rounded-full border border-emerald-400/50 flex items-center justify-center text-emerald-400">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight">Active Computational Engine</h3>
                        <p className="text-sm font-medium text-slate-400 mt-1 max-w-lg">All organizational services are operating efficiently. No bottleneck anomalies detected in backend execution.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Usage;
