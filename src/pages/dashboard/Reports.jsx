import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText, TrendingUp, BadgeCheck, Download, RefreshCw, AlertCircle,
    Loader2, ChevronRight, ArrowUpRight, Calendar, BarChart2, ShieldCheck,
    FileCheck, Clock, AlertTriangle, CheckCircle2, XCircle, Filter
} from 'lucide-react';
import { clsx } from 'clsx';
import { reportsService } from '../../api/reports';

const REPORT_TYPES = [
    { id: 'filing', label: 'Filing Report', icon: FileText, color: 'blue', desc: 'Submission trends, late filings, overdue analysis' },
    { id: 'refund', label: 'Refund Report', icon: TrendingUp, color: 'amber', desc: 'Refund flow, disbursement rates, SLA compliance' },
    { id: 'compliance', label: 'Compliance Report', icon: BadgeCheck, color: 'green', desc: 'Risk levels, alert distribution, score trends' },
    { id: 'risk', label: 'Risk Assessment', icon: ShieldCheck, color: 'rose', desc: 'Entity exposure, audit risk, enforcement status' },
];

const StatPill = ({ label, value, color = 'slate' }) => {
    const colors = {
        green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        slate: 'bg-slate-50 text-slate-600 border-slate-100',
    };
    return (
        <div className={clsx('flex flex-col items-center justify-center px-5 py-4 rounded-2xl border', colors[color])}>
            <span className="text-2xl font-black tracking-tight">{value ?? '—'}</span>
            <span className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">{label}</span>
        </div>
    );
};

const FilingReportSection = ({ data }) => {
    if (!data) return null;
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatPill label="Total Filings" value={data.total_filings} color="blue" />
                <StatPill label="Submitted" value={data.by_status?.submitted || 0} color="green" />
                <StatPill label="Late" value={data.late_filings} color="amber" />
                <StatPill label="Overdue" value={data.overdue_filings} color="rose" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-3xl p-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Filings by Tax Type</h4>
                    <div className="space-y-3">
                        {Object.entries(data.by_tax_type || {}).map(([type, count]) => {
                            const total = Object.values(data.by_tax_type || {}).reduce((a, b) => a + b, 0) || 1;
                            return (
                                <div key={type} className="flex items-center gap-3">
                                    <span className="w-12 text-[10px] font-black text-slate-400 uppercase">{type}</span>
                                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 w-6 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="bg-slate-50 rounded-3xl p-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Filings by Status</h4>
                    <div className="space-y-3">
                        {Object.entries(data.by_status || {}).map(([status, count]) => {
                            const colorMap = { submitted: 'bg-emerald-400', draft: 'bg-slate-300', overdue: 'bg-rose-400', late: 'bg-amber-400', acknowledged: 'bg-blue-400' };
                            const total = Object.values(data.by_status || {}).reduce((a, b) => a + b, 0) || 1;
                            return (
                                <div key={status} className="flex items-center gap-3">
                                    <span className="w-20 text-[10px] font-black text-slate-400 uppercase truncate">{status}</span>
                                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                                        <div className={clsx('h-full rounded-full', colorMap[status] || 'bg-indigo-400')} style={{ width: `${(count / total) * 100}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 w-6 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatPill label="On-Time Rate" value={data.on_time_rate ? `${data.on_time_rate.toFixed(1)}%` : 'N/A'} color="green" />
                <StatPill label="Avg Tax Due" value={data.total_tax_due ? `₦${Number(data.total_tax_due).toLocaleString()}` : 'N/A'} color="blue" />
                <StatPill label="Total Tax Paid" value={data.total_tax_paid ? `₦${Number(data.total_tax_paid).toLocaleString()}` : 'N/A'} color="slate" />
            </div>
        </div>
    );
};

const RefundReportSection = ({ data, metrics }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatPill label="Total Cases" value={data?.total_cases} color="amber" />
                <StatPill label="Open Cases" value={metrics?.open_cases} color="blue" />
                <StatPill label="Disbursed" value={data?.by_status?.disbursed || 0} color="green" />
                <StatPill label="Rejected" value={data?.by_status?.rejected || 0} color="rose" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-3xl p-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Cases by Status</h4>
                    <div className="space-y-3">
                        {Object.entries(data?.by_status || {}).map(([status, count]) => {
                            const colorMap = { disbursed: 'bg-emerald-400', rejected: 'bg-rose-400', under_review: 'bg-amber-400', approved: 'bg-blue-400', withdrawn: 'bg-slate-300' };
                            const total = Object.values(data?.by_status || {}).reduce((a, b) => a + b, 0) || 1;
                            return (
                                <div key={status} className="flex items-center gap-3">
                                    <span className="w-24 text-[10px] font-black text-slate-400 uppercase truncate">{status.replace('_', ' ')}</span>
                                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                                        <div className={clsx('h-full rounded-full', colorMap[status] || 'bg-indigo-400')} style={{ width: `${(count / total) * 100}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 w-6 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="bg-slate-50 rounded-3xl p-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Financial Summary</h4>
                    <div className="space-y-4">
                        {[
                            { label: 'Total Claimed', value: data?.total_amount_claimed, c: 'blue' },
                            { label: 'Total Approved', value: data?.total_amount_approved, c: 'green' },
                            { label: 'Total Disbursed', value: data?.total_amount_disbursed, c: 'amber' },
                            { label: 'Pending Amount', value: metrics?.total_pending_amount, c: 'rose' },
                        ].map(row => (
                            <div key={row.label} className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.label}</span>
                                <span className="text-sm font-black text-slate-900">₦{Number(row.value || 0).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatPill label="SLA Compliance" value={metrics?.sla_compliance_rate ? `${metrics.sla_compliance_rate.toFixed(1)}%` : 'N/A'} color="green" />
                <StatPill label="Avg Processing Days" value={data?.average_processing_days ? `${data.average_processing_days.toFixed(0)}d` : 'N/A'} color="slate" />
                <StatPill label="Overdue Cases" value={data?.overdue_cases} color="rose" />
            </div>
        </div>
    );
};

const ComplianceReportSection = ({ data, stats }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatPill label="Avg Score" value={stats?.average_score ? `${stats.average_score.toFixed(0)}%` : '—'} color="green" />
            <StatPill label="Active Alerts" value={data?.active_alerts} color="rose" />
            <StatPill label="Critical" value={data?.critical_alerts} color="rose" />
            <StatPill label="Total Entities" value={stats?.total_taxpayers} color="blue" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-3xl p-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Risk Distribution</h4>
                <div className="space-y-3">
                    {Object.entries(data?.risk_distribution || {}).map(([level, count]) => {
                        const total = Object.values(data?.risk_distribution || {}).reduce((a, b) => a + b, 0) || 1;
                        const colorMap = { low: 'bg-emerald-400', medium: 'bg-amber-400', high: 'bg-orange-500', critical: 'bg-rose-500' };
                        return (
                            <div key={level} className="flex items-center gap-3">
                                <span className="w-16 text-[10px] font-black text-slate-400 uppercase">{level}</span>
                                <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden">
                                    <div className={clsx('h-full rounded-full', colorMap[level])} style={{ width: `${(count / total) * 100}%` }} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 w-6 text-right">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="bg-slate-50 rounded-3xl p-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Top Violations</h4>
                <div className="space-y-3">
                    {(stats?.top_violations || []).map((v, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 truncate">{v.rule_code?.replace(/_/g, ' ')}</span>
                            <span className="shrink-0 ml-4 text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{v.count} entities</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const RiskReportSection = ({ report }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatPill label="Total Entities" value={report?.total_taxpayers} color="blue" />
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Entity Risk Assessment</h4>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            {['Taxpayer', 'Score', 'Risk Level', 'Violations', 'Calc Date'].map(h => (
                                <th key={h} className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {(report?.data || []).slice(0, 20).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-3 text-xs font-bold text-slate-800">{row.taxpayer_name}</td>
                                <td className="px-5 py-3">
                                    <span className={clsx('text-xs font-black', row.score >= 80 ? 'text-emerald-500' : row.score >= 60 ? 'text-amber-500' : 'text-rose-500')}>
                                        {row.score}%
                                    </span>
                                </td>
                                <td className="px-5 py-3">
                                    <span className={clsx('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full',
                                        row.risk_level === 'low' ? 'bg-emerald-50 text-emerald-600' :
                                            row.risk_level === 'medium' ? 'bg-amber-50 text-amber-600' :
                                                row.risk_level === 'high' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600')}>
                                        {row.risk_level}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-xs font-bold text-slate-500">{row.triggered_rules}</td>
                                <td className="px-5 py-3 text-[10px] text-slate-400">{row.calculation_date ? new Date(row.calculation_date).toLocaleDateString() : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const Reports = () => {
    const [activeReport, setActiveReport] = useState('filing');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState({});

    const fetchReportData = useCallback(async (type) => {
        setLoading(true);
        setError(null);
        try {
            let result = {};
            if (type === 'filing') {
                const [stats, calendar] = await Promise.all([
                    reportsService.getFilingStats(),
                    reportsService.getFilingCalendarEvents(),
                ]);
                result = { stats, calendar };
            } else if (type === 'refund') {
                const [stats, metrics] = await Promise.all([
                    reportsService.getRefundStats(),
                    reportsService.getRefundDashboardMetrics(90),
                ]);
                result = { stats, metrics };
            } else if (type === 'compliance') {
                const [dashboard, stats] = await Promise.all([
                    reportsService.getComplianceDashboard(),
                    reportsService.getComplianceStats(),
                ]);
                result = { dashboard, stats };
            } else if (type === 'risk') {
                const report = await reportsService.getComplianceRiskReport();
                result = { report };
            }
            setReportData(prev => ({ ...prev, [type]: result }));
        } catch (err) {
            console.error(`Report fetch error (${type}):`, err);
            setError(`Failed to load ${type} report data.`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!reportData[activeReport]) {
            fetchReportData(activeReport);
        }
    }, [activeReport, fetchReportData, reportData]);

    const current = reportData[activeReport];

    return (
        <div className="space-y-10 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Reports Center</h1>
                    <p className="text-slate-500 font-medium">Generate and review operational reports across all modules.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchReportData(activeReport)}
                        className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 active:scale-95"
                    >
                        <RefreshCw className={clsx('w-5 h-5', loading && 'animate-spin')} />
                    </button>
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {REPORT_TYPES.map(rt => {
                    const isActive = activeReport === rt.id;
                    const colorMap = {
                        blue: isActive ? 'bg-blue-500 text-white border-blue-500' : 'bg-white hover:border-blue-200 text-slate-700',
                        amber: isActive ? 'bg-amber-500 text-white border-amber-500' : 'bg-white hover:border-amber-200 text-slate-700',
                        green: isActive ? 'bg-ree-green text-white border-ree-green' : 'bg-white hover:border-green-200 text-slate-700',
                        rose: isActive ? 'bg-rose-500 text-white border-rose-500' : 'bg-white hover:border-rose-200 text-slate-700',
                    };
                    const iconColorMap = {
                        blue: isActive ? 'text-white' : 'text-blue-500',
                        amber: isActive ? 'text-white' : 'text-amber-500',
                        green: isActive ? 'text-white' : 'text-ree-green',
                        rose: isActive ? 'text-white' : 'text-rose-500',
                    };
                    return (
                        <button
                            key={rt.id}
                            onClick={() => setActiveReport(rt.id)}
                            className={clsx(
                                'p-5 rounded-[2rem] border-2 flex flex-col gap-3 text-left transition-all duration-200 hover:shadow-lg active:scale-95',
                                colorMap[rt.color]
                            )}
                        >
                            <rt.icon className={clsx('w-6 h-6', iconColorMap[rt.color])} />
                            <div>
                                <p className="text-sm font-black tracking-tight">{rt.label}</p>
                                <p className={clsx('text-[10px] font-medium mt-0.5 leading-snug', isActive ? 'opacity-80' : 'text-slate-400')}>{rt.desc}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Report Content */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">
                            {REPORT_TYPES.find(r => r.id === activeReport)?.label}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Generated {new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                    </div>
                    {loading && <Loader2 className="w-5 h-5 text-ree-green animate-spin" />}
                </div>

                <div className="p-8">
                    {error ? (
                        <div className="flex flex-col items-center gap-4 py-20 text-center">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-400">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-bold text-slate-500">{error}</p>
                            <button onClick={() => fetchReportData(activeReport)} className="text-ree-green font-bold text-sm hover:underline">Retry</button>
                        </div>
                    ) : loading && !current ? (
                        <div className="flex flex-col items-center gap-4 py-24">
                            <Loader2 className="w-12 h-12 text-ree-green animate-spin" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Compiling Report Data...</p>
                        </div>
                    ) : (
                        <>
                            {activeReport === 'filing' && <FilingReportSection data={current?.stats} />}
                            {activeReport === 'refund' && <RefundReportSection data={current?.stats} metrics={current?.metrics} />}
                            {activeReport === 'compliance' && <ComplianceReportSection data={current?.dashboard} stats={current?.stats} />}
                            {activeReport === 'risk' && <RiskReportSection report={current?.report} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
