import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText,
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Plus,
    Loader2,
    Calendar,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { filingService } from '../../api/filings';
import { clsx } from 'clsx';
import SidePanel from '../../components/ui/SidePanel';

const FilingStatusBadge = ({ status }) => {
    const styles = {
        DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
        SUBMITTED: "bg-blue-50 text-blue-600 border-blue-100",
        ACKNOWLEDGED: "bg-emerald-50 text-emerald-600 border-emerald-100",
        REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
        AMENDED: "bg-amber-50 text-amber-600 border-amber-100",
    };
    return (
        <span className={clsx(
            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
            styles[status] || styles.DRAFT
        )}>
            {status}
        </span>
    );
};

const Filings = () => {
    const [filings, setFilings] = useState([]);
    const [stats, setStats] = useState({ total: 0, submitted: 0, acknowledged: 0, late: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ status: '', tax_type: '', state: '' });
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [listData, statsData] = await Promise.all([
                filingService.getFilings({ page, search, ...filters }),
                filingService.getFilingStats()
            ]);
            setFilings(listData.items);
            setTotalPages(listData.pages);
            setStats({
                total: statsData.total_filings || 0,
                submitted: statsData.by_status?.SUBMITTED || 0,
                acknowledged: statsData.by_status?.ACKNOWLEDGED || 0,
                late: statsData.total_late || 0
            });
        } catch (error) {
            console.error("Error fetching filings:", error);
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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 italic">Filings Management</h1>
                    <p className="text-slate-500 font-medium tracking-wide">Track, verify and audit regulatory tax submissions.</p>
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
                        New Filing Record
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Filings', value: stats.total, icon: FileText, color: 'text-slate-900', bg: 'bg-slate-50' },
                    { label: 'Pending Review', value: stats.submitted, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Acknowledged', value: stats.acknowledged, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Late Submissions', value: stats.late, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.bg, item.color)}>
                            <item.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{item.value.toLocaleString()}</p>
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
                        placeholder="Search by Reference, Taxpayer, or TIN..."
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
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="ACKNOWLEDGED">Acknowledged</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                    <select
                        onChange={(e) => handleFilterChange('tax_type', e.target.value)}
                        className="flex-1 md:w-40 appearance-none bg-slate-50 border-transparent rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-ree-green/30 transition-all cursor-pointer"
                    >
                        <option value="">Tax Type</option>
                        <option value="PAYE">PAYE</option>
                        <option value="VAT">VAT</option>
                        <option value="CIT">CIT</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 gap-4">
                        <Loader2 className="w-12 h-12 text-ree-green animate-spin" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Filings Ledger...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Reference / Taxpayer</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tax Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Period</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filings.length > 0 ? filings.map((filing) => (
                                    <tr key={filing.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 tracking-tight group-hover:text-ree-green transition-colors">{filing.reference_number || 'N/A'}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{filing.taxpayer_name || filing.taxpayer?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-ree-green" />
                                                <span className="text-xs font-black text-slate-600 tracking-tight">{filing.tax_type}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-slate-500">{filing.period_start} - {filing.period_end}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <FilingStatusBadge status={filing.status} />
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                                <span className="text-xs font-bold text-slate-600">{new Date(filing.due_date).toLocaleDateString()}</span>
                                                {filing.is_late && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
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
                                                <FileText className="w-16 h-16" />
                                                <p className="font-black text-lg">No Filings Found</p>
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
                title="Register New Filing"
                subtitle="Formal tax submission record initialization."
            >
                <div className="p-10">
                    <p className="text-slate-500 italic">Filing registration form implementation in progress...</p>
                </div>
            </SidePanel>
        </div>
    );
};

export default Filings;
