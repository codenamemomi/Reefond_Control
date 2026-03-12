import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart2, TrendingUp, PieChart, Activity, RefreshCw, Loader2,
    AlertCircle, ArrowUp, ArrowDown, Minus, ChevronRight, FileText,
    Users, ShieldCheck, BadgeCheck, Calendar, DollarSign
} from 'lucide-react';
import { clsx } from 'clsx';
import { analyticsService } from '../../api/analytics';

// ── Tiny helpers ──────────────────────────────────────────────────────────────

const TrendBadge = ({ dir }) => {
    const map = {
        up: { Icon: ArrowUp, cls: 'bg-emerald-50 text-emerald-600' },
        down: { Icon: ArrowDown, cls: 'bg-rose-50 text-rose-600' },
        stable: { Icon: Minus, cls: 'bg-slate-100 text-slate-500' },
    };
    const { Icon, cls } = map[dir] || map.stable;
    return (
        <span className={clsx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest', cls)}>
            <Icon className="w-2.5 h-2.5" /> {dir}
        </span>
    );
};

// ── Mini horizontal bar chart ─────────────────────────────────────────────────
const HBar = ({ data, colorFn }) => {
    const max = Math.max(...Object.values(data || {}), 1);
    return (
        <div className="space-y-3">
            {Object.entries(data || {}).map(([key, val]) => (
                <div key={key} className="flex items-center gap-3">
                    <span className="w-20 text-[10px] font-black text-slate-400 uppercase shrink-0 truncate">{key.replace(/_/g, ' ')}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={clsx('h-full rounded-full transition-all duration-700', colorFn ? colorFn(key) : 'bg-ree-green')}
                            style={{ width: `${(val / max) * 100}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right shrink-0">{val}</span>
                </div>
            ))}
        </div>
    );
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, trendDir, accentClass }) => (
    <div className={clsx(
        'bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-7 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow',
    )}>
        <div className="flex items-start justify-between">
            <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center', accentClass || 'bg-slate-100 text-slate-500')}>
                <Icon className="w-6 h-6" />
            </div>
            {trendDir && <TrendBadge dir={trendDir} />}
        </div>
        <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value ?? '—'}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
            {sub && <p className="text-xs text-slate-400 font-medium mt-1">{sub}</p>}
        </div>
    </div>
);

// ── Section card wrapper ──────────────────────────────────────────────────────
const Section = ({ title, subtitle, children, className }) => (
    <div className={clsx('bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden', className)}>
        <div className="px-8 py-6 border-b border-slate-50">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        <div className="p-8">{children}</div>
    </div>
);

// ── Donut-like ring for compliance score ──────────────────────────────────────
const ScoreRing = ({ score = 0 }) => {
    const r = 54;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
                    <circle
                        cx="60" cy="60" r={r} fill="none"
                        stroke={color} strokeWidth="12"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">{score.toFixed(0)}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">score</span>
                </div>
            </div>
        </div>
    );
};

// ── Calendar heatmap (monthly event count) ────────────────────────────────────
const CalendarStrip = ({ events = [] }) => {
    const byDate = {};
    events.forEach(e => {
        const d = e.due_date?.slice(0, 10);
        if (d) byDate[d] = (byDate[d] || 0) + 1;
    });

    const today = new Date();
    const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i));
        const key = d.toISOString().slice(0, 10);
        return { key, count: byDate[key] || 0, label: d.getDate() };
    });

    const max = Math.max(...days.map(d => d.count), 1);

    return (
        <div>
            <div className="flex items-end gap-1">
                {days.map(d => (
                    <div key={d.key} className="flex flex-col items-center gap-1 flex-1">
                        <div
                            className={clsx('w-full rounded-sm transition-all', d.count ? 'bg-ree-green' : 'bg-slate-100')}
                            style={{ height: `${Math.max(4, (d.count / max) * 48)}px`, opacity: d.count ? (0.3 + 0.7 * (d.count / max)) : 1 }}
                            title={`${d.key}: ${d.count} filings`}
                        />
                        {d.label % 5 === 0 && (
                            <span className="text-[8px] text-slate-300 font-bold">{d.label}</span>
                        )}
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-2">Filing events — last 30 days</p>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        filing: null, refund: null, refundMetrics: null,
        compliance: null, complianceStats: null, orgStats: null, calendar: [],
    });

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const now = new Date();
            const start = new Date(now);
            start.setDate(start.getDate() - 30);
            const fmt = d => d.toISOString().slice(0, 10);

            const [filing, refund, refundMetrics, compliance, complianceStats, orgStats, calendar] = await Promise.allSettled([
                analyticsService.getFilingStats(),
                analyticsService.getRefundStats(),
                analyticsService.getRefundMetrics(90),
                analyticsService.getComplianceDashboard(),
                analyticsService.getComplianceStats(),
                analyticsService.getOrganizationStats(),
                analyticsService.getCalendarEvents(fmt(start), fmt(now)),
            ]);

            setData({
                filing: filing.status === 'fulfilled' ? filing.value : null,
                refund: refund.status === 'fulfilled' ? refund.value : null,
                refundMetrics: refundMetrics.status === 'fulfilled' ? refundMetrics.value : null,
                compliance: compliance.status === 'fulfilled' ? compliance.value : null,
                complianceStats: complianceStats.status === 'fulfilled' ? complianceStats.value : null,
                orgStats: orgStats.status === 'fulfilled' ? orgStats.value : null,
                calendar: calendar.status === 'fulfilled' ? (calendar.value || []) : [],
            });
        } catch (err) {
            console.error('Analytics fetch error:', err);
            setError('Failed to load analytics. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const { filing, refund, refundMetrics, compliance, complianceStats, orgStats, calendar } = data;

    // ── KPIs ──
    const kpis = [
        {
            icon: FileText, label: 'Total Filings', accentClass: 'bg-blue-50 text-blue-500',
            value: filing?.total_filings ?? '—',
            sub: filing?.late_filings ? `${filing.late_filings} late` : null,
            trendDir: filing?.on_time_rate >= 90 ? 'up' : filing?.on_time_rate >= 70 ? 'stable' : 'down',
        },
        {
            icon: TrendingUp, label: 'Refund Cases', accentClass: 'bg-amber-50 text-amber-500',
            value: refund?.total_cases ?? '—',
            sub: refundMetrics?.open_cases ? `${refundMetrics.open_cases} open` : null,
            trendDir: 'stable',
        },
        {
            icon: BadgeCheck, label: 'Avg Compliance', accentClass: 'bg-emerald-50 text-emerald-500',
            value: complianceStats?.average_score ? `${complianceStats.average_score.toFixed(0)}%` : '—',
            sub: compliance?.active_alerts ? `${compliance.active_alerts} active alerts` : null,
            trendDir: compliance?.compliance_trend === 'improving' ? 'up' : compliance?.compliance_trend === 'declining' ? 'down' : 'stable',
        },
        {
            icon: Users, label: 'Organizations', accentClass: 'bg-indigo-50 text-indigo-500',
            value: orgStats?.total_organizations ?? '—',
            sub: orgStats?.total_taxpayers ? `${orgStats.total_taxpayers} taxpayers` : null,
            trendDir: 'stable',
        },
        {
            icon: DollarSign, label: 'Total Claimed', accentClass: 'bg-rose-50 text-rose-500',
            value: refund?.total_amount_claimed ? `₦${Number(refund.total_amount_claimed).toLocaleString()}` : '—',
            sub: refund?.total_amount_disbursed ? `₦${Number(refund.total_amount_disbursed).toLocaleString()} disbursed` : null,
            trendDir: 'stable',
        },
        {
            icon: ShieldCheck, label: 'Active Alerts', accentClass: 'bg-rose-50 text-rose-500',
            value: compliance?.active_alerts ?? '—',
            sub: compliance?.critical_alerts ? `${compliance.critical_alerts} critical` : null,
            trendDir: (compliance?.active_alerts || 0) === 0 ? 'up' : 'down',
        },
    ];

    return (
        <div className="space-y-10 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Analytics Hub</h1>
                    <p className="text-slate-500 font-medium">Real-time operational intelligence across filings, refunds, and compliance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm">
                        <div className={clsx('w-2 h-2 rounded-full', loading ? 'bg-amber-500 animate-pulse' : 'bg-ree-green')} />
                        <span className="text-sm font-bold text-slate-700">{loading ? 'Syncing...' : 'Live Data'}</span>
                    </div>
                    <button
                        onClick={fetchAll}
                        className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 active:scale-95"
                    >
                        <RefreshCw className={clsx('w-5 h-5', loading && 'animate-spin')} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 px-6 py-4 rounded-3xl flex items-center gap-3 text-rose-600">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-bold">{error}</span>
                    <button onClick={fetchAll} className="ml-auto text-xs font-black underline hover:no-underline">Retry</button>
                </div>
            )}

            {loading && !data.filing ? (
                <div className="flex flex-col items-center gap-6 py-32">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-ree-green animate-spin" />
                        <BarChart2 className="absolute inset-0 m-auto w-8 h-8 text-ree-green" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Aggregating Analytics Data...</p>
                </div>
            ) : (
                <>
                    {/* KPI Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
                    </div>

                    {/* Row 2: Filing Activity + Compliance Score */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Filing Activity Heatmap */}
                        <Section title="Filing Activity" subtitle="Events in the last 30 days" className="lg:col-span-2">
                            <CalendarStrip events={calendar} />
                            {filing && (
                                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'On-Time Rate', value: filing.on_time_rate ? `${filing.on_time_rate.toFixed(1)}%` : '—', good: (filing.on_time_rate || 0) >= 80 },
                                        { label: 'Late Filings', value: filing.late_filings ?? '—', good: (filing.late_filings || 0) === 0 },
                                        { label: 'Tax Due', value: filing.total_tax_due ? `₦${Number(filing.total_tax_due).toLocaleString()}` : '—', good: true },
                                        { label: 'Tax Paid', value: filing.total_tax_paid ? `₦${Number(filing.total_tax_paid).toLocaleString()}` : '—', good: true },
                                    ].map(m => (
                                        <div key={m.label} className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1">
                                            <span className={clsx('text-lg font-black', m.good ? 'text-slate-900' : 'text-rose-500')}>{m.value}</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>

                        {/* Compliance Score Ring */}
                        <Section title="Compliance Health" subtitle="Organization average">
                            <div className="flex flex-col items-center gap-6">
                                <ScoreRing score={complianceStats?.average_score || 0} />
                                <div className="w-full space-y-3">
                                    {[
                                        { label: 'Low Risk', count: complianceStats?.by_risk_level?.low || 0, color: 'bg-emerald-400' },
                                        { label: 'Medium Risk', count: complianceStats?.by_risk_level?.medium || 0, color: 'bg-amber-400' },
                                        { label: 'High Risk', count: complianceStats?.by_risk_level?.high || 0, color: 'bg-orange-400' },
                                        { label: 'Critical', count: complianceStats?.by_risk_level?.critical || 0, color: 'bg-rose-500' },
                                    ].map(row => {
                                        const total = Object.values(complianceStats?.by_risk_level || {}).reduce((a, b) => a + b, 0) || 1;
                                        return (
                                            <div key={row.label} className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase w-20 shrink-0">{row.label}</span>
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={clsx('h-full rounded-full', row.color)} style={{ width: `${(row.count / total) * 100}%` }} />
                                                </div>
                                                <span className="text-xs font-black text-slate-700 w-5 text-right">{row.count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* Row 3: Filings by type + Refund by Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Section title="Filings by Tax Type" subtitle="All time distribution">
                            <HBar data={filing?.by_tax_type} colorFn={() => 'bg-blue-400'} />
                        </Section>
                        <Section title="Refunds by Status" subtitle="Current case distribution">
                            <HBar
                                data={refund?.by_status}
                                colorFn={key => ({
                                    disbursed: 'bg-emerald-400', rejected: 'bg-rose-400',
                                    under_review: 'bg-amber-400', approved: 'bg-blue-400', withdrawn: 'bg-slate-300',
                                }[key] || 'bg-indigo-400')}
                            />
                        </Section>
                    </div>

                    {/* Row 4: Refund financial + SLA */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Section title="Refund Financials" subtitle="Claimed vs disbursed" className="lg:col-span-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                {[
                                    { label: 'Total Claimed', val: refund?.total_amount_claimed, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { label: 'Total Approved', val: refund?.total_amount_approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { label: 'Total Disbursed', val: refund?.total_amount_disbursed, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    { label: 'Pending Amount', val: refundMetrics?.total_pending_amount, color: 'text-rose-600', bg: 'bg-rose-50' },
                                ].map(row => (
                                    <div key={row.label} className={clsx('p-5 rounded-3xl flex flex-col gap-2', row.bg)}>
                                        <span className={clsx('text-xl font-black', row.color)}>
                                            ₦{Number(row.val || 0).toLocaleString()}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title="SLA Performance" subtitle="Refund processing">
                            <div className="flex flex-col gap-5">
                                {[
                                    { label: 'SLA Compliance', value: refundMetrics?.sla_compliance_rate ? `${refundMetrics.sla_compliance_rate.toFixed(1)}%` : '—', good: (refundMetrics?.sla_compliance_rate || 0) >= 80 },
                                    { label: 'Open Cases', value: refundMetrics?.open_cases ?? '—', good: (refundMetrics?.open_cases || 0) < 20 },
                                    { label: 'Under Review', value: refundMetrics?.under_review ?? '—', good: true },
                                    { label: 'Avg Days', value: refund?.average_processing_days ? `${refund.average_processing_days.toFixed(0)}d` : '—', good: (refund?.average_processing_days || 999) < 45 },
                                ].map(row => (
                                    <div key={row.label} className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                                        <span className={clsx('text-sm font-black', row.good ? 'text-slate-900' : 'text-rose-500')}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>

                    {/* Row 5: Top compliance violations */}
                    {complianceStats?.top_violations?.length > 0 && (
                        <Section title="Top Compliance Violations" subtitle="Most triggered rules across all entities">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {complianceStats.top_violations.slice(0, 6).map((v, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-rose-50 transition-colors group">
                                        <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 text-xs font-black text-rose-500">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 group-hover:text-rose-600 transition-colors truncate">
                                                {v.rule_code?.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-[10px] font-black text-rose-500 bg-rose-50 border border-rose-100 rounded-full px-2.5 py-1">
                                            {v.count} entities
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                </>
            )}
        </div>
    );
};

export default Analytics;
