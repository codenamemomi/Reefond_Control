import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    AlertCircle,
    TrendingUp,
    FileText,
    Calendar,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { dashboardService } from '../../api/dashboard';
import { clsx } from 'clsx';
import HealthScore from '../../components/dashboard/overview/HealthScore';

const Compliance = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCompliance = async () => {
            try {
                const result = await dashboardService.getComplianceDashboard();
                setData(result);
            } catch (err) {
                console.error("Error fetching compliance data:", err);
                setError("Failed to load compliance data.");
            } finally {
                setLoading(false);
            }
        };
        fetchCompliance();
    }, []);

    if (error) {
        return (
            <div className="p-32 flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{error}</h3>
                <button onClick={() => window.location.reload()} className="text-ree-green font-bold hover:underline">Retry Connection</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-32 flex flex-col items-center gap-6">
                <Loader2 className="w-16 h-16 text-ree-green animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Analyzing Compliance Vectors...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Compliance Monitoring</h1>
                    <p className="text-slate-500 font-medium">Strategic oversight and regulatory risk assessment.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95">
                        <FileText className="w-4 h-4" />
                        Generate Audit Report
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Health Score Main Card */}
                <div className="lg:col-span-1">
                    <HealthScore score={data?.overall_score || 0} />
                </div>

                {/* Risk Distribution & Trend */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Risk Distribution</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Entity Risk Classification</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(data?.risk_distribution || {}).map(([level, count]) => (
                                <div key={level} className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-xs font-bold px-1">
                                        <span className="uppercase tracking-widest text-slate-400">{level}</span>
                                        <span className="text-slate-900">{count} Entities</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={clsx(
                                                "h-full transition-all duration-1000",
                                                level === 'low' ? 'bg-emerald-400' :
                                                    level === 'medium' ? 'bg-amber-400' :
                                                        level === 'high' ? 'bg-orange-400' : 'bg-rose-500'
                                            )}
                                            style={{ width: `${(count / (Object.values(data?.risk_distribution || {}).reduce((a, b) => a + b, 0) || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden group">
                            <ShieldCheck className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Active Alerts</h4>
                                <p className="text-4xl font-black tracking-tighter">{data?.active_alerts || 0}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-rose-400 bg-rose-400/10 self-start px-3 py-1.5 rounded-full border border-rose-400/20">
                                <AlertCircle className="w-4 h-4" />
                                {data?.critical_alerts || 0} Critical Violations
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 flex items-center justify-between group hover:border-ree-green/20 transition-all cursor-pointer shadow-sm">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-ree-green flex items-center justify-center">
                                    <Calendar className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">Next Compliance Cycle</h4>
                                    <p className="text-xs text-slate-500 font-medium">Ends in 12 days</p>
                                </div>
                            </div>
                            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Concerns */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">High Risk Concerns</h3>
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">Manual Review Necessary</span>
                    </div>
                    <div className="p-4 space-y-3">
                        {data?.top_concerns?.map((concern, i) => (
                            <div key={i} className="p-5 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 rounded-3xl transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-500 font-black text-xs">
                                        {concern.score}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{concern.taxpayer_name}</p>
                                        <div className="flex gap-2 mt-1">
                                            {concern.main_issues?.map((issue, j) => (
                                                <span key={j} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{issue}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-300 hover:text-ree-green transition-colors">
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Compliance Scores */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Evaluations</h3>
                        <button className="text-[10px] font-black text-ree-green uppercase tracking-[0.2em] hover:text-ree-light transition-colors">View History</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Entity</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Score</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Risk</th>
                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data?.recent_scores?.map((score, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4 text-xs font-bold text-slate-700">{score.taxpayer_name}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "text-xs font-black",
                                                score.score >= 90 ? 'text-emerald-500' : score.score >= 70 ? 'text-amber-500' : 'text-rose-500'
                                            )}>{score.score}%</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                                score.risk_level === 'low' ? 'bg-emerald-50 text-emerald-500' :
                                                    score.risk_level === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
                                            )}>{score.risk_level}</span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-medium text-slate-400">{new Date(score.calculation_date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Compliance;
