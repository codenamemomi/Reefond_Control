import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import { dashboardService } from '../../api/dashboard';
import { authService } from '../../api/auth';

// New Overview Components
import HealthScore from '../../components/dashboard/overview/HealthScore';
import FilingStatus from '../../components/dashboard/overview/FilingStatus';
import ActionPanel from '../../components/dashboard/overview/ActionPanel';
import RefundTracker from '../../components/dashboard/overview/RefundTracker';
import ActivityFeed from '../../components/dashboard/overview/ActivityFeed';
import ComplianceTimeline from '../../components/dashboard/overview/ComplianceTimeline';
import QuickActions from '../../components/dashboard/overview/QuickActions';
import OrgSnapshot from '../../components/dashboard/overview/OrgSnapshot';
import RiskIndicators from '../../components/dashboard/overview/RiskIndicators';

const Overview = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        stats: [],
        compliance: null,
        refunds: null,
        filings: null,
        activities: [],
        alerts: [],
        timeline: [],
        user: null,
    });

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [overview, compliance, refunds, filings, activities, alerts, timeline, user] = await Promise.all([
                dashboardService.getOverviewStats(),
                dashboardService.getComplianceDashboard(),
                dashboardService.getRefundMetrics(),
                dashboardService.getFilingStats(),
                dashboardService.getRecentActivities(),
                dashboardService.getComplianceAlerts(),
                dashboardService.getCalendarEvents(),
                authService.getCurrentUser(),
            ]);

            setData({
                stats: [
                    { title: 'Active Filings', value: (overview.total_filings_last_month || 0).toString(), icon: 'FileText', trend: 'neutral', trendValue: 'Safe', color: 'blue-500' },
                    { title: 'Refund Cases', value: (overview.total_refunds || 0).toString(), icon: 'TrendingUp', trend: 'up', trendValue: 'Active', color: 'amber-500' },
                    { title: 'Total Entities', value: (overview.total_organizations || 0).toString(), icon: 'Users', trend: 'up', trendValue: `+${overview.total_taxpayers || 0} TPS`, color: 'indigo-500' },
                    { title: 'System Alerts', value: (alerts?.length || 0).toString(), icon: 'BadgeCheck', trend: 'down', trendValue: 'High Priority', color: 'ree-green' },
                ],
                compliance: compliance || {},
                refunds: refunds || {},
                filings: filings || {},
                activities: activities || [],
                alerts: alerts || [],
                timeline: timeline || [],
                user: user,
            });
        } catch (err) {
            console.error('Dashboard Fetch Error:', err);
            setError('Failed to fetch live dashboard data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    if (loading && !data.stats.length) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <RefreshCw className="w-12 h-12 text-ree-green animate-spin" />
                <p className="font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Control Data...</p>
            </div>
        );
    }

    const currentOrg = data.user?.organization;
    const mappedOrg = currentOrg ? {
        name: currentOrg.name,
        tin: currentOrg.tax_identification_number || 'N/A',
        vat: currentOrg.vat_registered ? 'Active' : 'Not Registered',
        location: currentOrg.address || 'N/A'
    } : null;

    return (
        <div className="space-y-10 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">System Overview</h1>
                    <p className="text-slate-500 font-medium">Global compliance monitoring & operational control.</p>
                </div>
                <div className="flex items-center gap-3">
                    {error && (
                        <div className="bg-rose-50 border border-rose-100 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-rose-600 text-xs font-bold">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                    <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm">
                        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-ree-green'}`} />
                        <span className="text-sm font-bold text-slate-700">{loading ? 'Syncing...' : 'Live Backend Stream'}</span>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 active:scale-95"
                    >
                        <RefreshCw className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Row 1: Key Metrics & Quick Actions */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.stats.map((stat, idx) => (
                        <StatCard key={idx} {...stat} />
                    ))}
                </div>
                <QuickActions />
            </div>

            {/* Row 2: Core Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <HealthScore score={data.compliance?.overall_score || 0} />
                </div>
                <div className="lg:col-span-1">
                    <FilingStatus data={data.filings?.by_status} />
                </div>
                <div className="lg:col-span-1">
                    <ActionPanel alerts={data.alerts} />
                </div>
            </div>

            {/* Row 3: Tracking & Risk */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <RefundTracker metrics={data.refunds} />
                </div>
                <div className="lg:col-span-1">
                    <RiskIndicators dashboard={data.compliance} />
                </div>
                <div className="lg:col-span-1">
                    <ActivityFeed activities={data.activities} />
                </div>
            </div>

            {/* Row 4: Context & Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <OrgSnapshot org={mappedOrg} />
                <ComplianceTimeline timeline={data.timeline} />
            </div>
        </div>
    );
};

export default Overview;
