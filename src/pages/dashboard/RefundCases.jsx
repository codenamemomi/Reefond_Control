import React, { useState, useEffect, useCallback } from 'react';
import {
    Briefcase,
    Search,
    Filter,
    MoreHorizontal,
    ShieldCheck,
    Clock,
    AlertCircle,
    Download,
    Plus,
    Loader2,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    TrendingDown,
    Banknote
} from 'lucide-react';
import { refundService } from '../../api/refunds';
import { clsx } from 'clsx';
import SidePanel from '../../components/ui/SidePanel';

const RefundStatusBadge = ({ status }) => {
    const styles = {
        INITIATED: "bg-slate-100 text-slate-600 border-slate-200",
        VERIFIED: "bg-blue-50 text-blue-600 border-blue-100",
        SUBMITTED_TO_TAX_OFFICE: "bg-indigo-50 text-indigo-600 border-indigo-100",
        APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
        REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
        DISBURSED: "bg-ree-green/5 text-ree-green border-ree-green/20",
    };
    return (
        <span className={clsx(
            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
            styles[status] || styles.INITIATED
        )}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
};

const RefundCases = () => {
    const [refunds, setRefunds] = useState([]);
    const [stats, setStats] = useState({ total_count: 0, pending: 0, approved: 0, total_amount: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ status: '', priority: '' });
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [listData, statsData] = await Promise.all([
                refundService.getRefunds({ page, search, ...filters }),
                refundService.getRefundStats()
            ]);
            setRefunds(listData.items);
            setTotalPages(listData.pages);
            setStats({
                total_count: statsData.total_cases || 0,
                pending: statsData.by_status?.INITIATED || 0,
                approved: statsData.by_status?.APPROVED || 0,
                total_amount: statsData.total_amount_approved || 0
            });
        } catch (error) {
            console.error("Error fetching refunds:", error);
        } finally {
            setLoading(false);
        }
    }, [page, search, filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 italic">Refund Claims</h1>
                    <p className="text-slate-500 font-medium tracking-wide">Strategic oversight of tax recovery and disbursements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 rounded-2xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all">
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsPanelOpen(true)}
                        className="bg-ree-green text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-ree-light transition-all flex items-center gap-2 shadow-xl shadow-ree-green/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Initiate Claim
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Claims', value: stats.total_count, icon: Briefcase, color: 'text-slate-900', bg: 'bg-slate-50' },
                    { label: 'Awaiting Initiation', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Approved Claims', value: stats.approved, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Total Recovered', value: stats.total_amount, icon: Banknote, color: 'text-ree-green', bg: 'bg-emerald-50/50', isMoney: true },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.bg, item.color)}>
                            <item.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                {item.isMoney && '₦'}{item.value.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-ree-green transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Case Number, Reason, or Taxpayer..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-3xl text-sm font-medium focus:bg-white focus:border-ree-green/30 focus:ring-0 transition-all outline-none"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto px-2">
                    <select
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="flex-1 md:w-40 appearance-none bg-slate-50 border-transparent rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-ree-green/30 transition-all cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="INITIATED">Initiated</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="DISBURSED">Disbursed</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 gap-4">
                        <Loader2 className="w-12 h-12 text-ree-green animate-spin" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Recovery Vault...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Case ID / Entity</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Claim Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Est. Completion</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {refunds.length > 0 ? refunds.map((refund) => (
                                    <tr key={refund.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 tracking-tight group-hover:text-ree-green transition-colors">{refund.case_number}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{refund.taxpayer_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-slate-900">₦{refund.amount_claimed?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={clsx(
                                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                                refund.priority === 'HIGH' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                    refund.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                            )}>{refund.priority}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <RefundStatusBadge status={refund.status} />
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                                <span className="text-xs font-bold text-slate-600">{refund.expected_completion_date ? new Date(refund.expected_completion_date).toLocaleDateString() : 'TBD'}</span>
                                                {refund.is_overdue && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button className="p-2 rounded-xl border border-slate-100 hover:border-ree-green/30 hover:bg-ree-green/5 text-slate-400 hover:text-ree-green transition-all">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-xl border border-slate-100 hover:bg-slate-900 hover:text-white transition-all">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-30 grayscale">
                                                <Briefcase className="w-16 h-16" />
                                                <p className="font-black text-lg">No Recovery Cases</p>
                                                <p className="text-xs font-bold">Try adjusting your filters or search term.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-slate-900 hover:text-white transition-all focus:scale-95"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-slate-900 hover:text-white transition-all focus:scale-95"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <SidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                title="Initiate Recovery Claim"
                subtitle="Initialize a new refund case for formal tax credit processing."
            >
                <div className="p-10">
                    <p className="text-slate-500 italic">Refund initiation form implementation in progress...</p>
                </div>
            </SidePanel>
        </div>
    );
};

export default RefundCases;
