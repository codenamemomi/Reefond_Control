import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
    Banknote,
    FileText,
    Check,
    X,
    Ban,
    Send,
    History
} from 'lucide-react';
import { refundService } from '../../api/refunds';
import { taxpayerService } from '../../api/taxpayers';
import { filingService } from '../../api/filings';
import { clsx } from 'clsx';
import SidePanel from '../../components/ui/SidePanel';
import Input from '../../components/ui/Input';

const RefundStatusBadge = ({ status }) => {
    const styles = {
        INITIATED: "bg-slate-100 text-slate-600 border-slate-200",
        VERIFIED: "bg-blue-50 text-blue-600 border-blue-100",
        UNDER_REVIEW: "bg-indigo-50 text-indigo-600 border-indigo-100",
        APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
        REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
        DISBURSED: "bg-ree-green/10 text-ree-green border-ree-green/20",
        APPEALED: "bg-violet-50 text-violet-600 border-violet-100",
        WITHDRAWN: "bg-slate-200 text-slate-500 border-slate-300",
        CLOSED: "bg-slate-900 text-white border-slate-800",
    };
    return (
        <span className={clsx(
            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
            styles[status?.toUpperCase()] || styles.INITIATED
        )}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
};

const RefundCaseForm = ({ onSuccess, onCancel }) => {
    const [taxpayers, setTaxpayers] = useState([]);
    const [filings, setFilings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [taxpayerLoading, setTaxpayerLoading] = useState(true);
    const [formData, setFormData] = useState({
        taxpayer_id: '',
        filing_id: '',
        amount_claimed: '',
        reason: '',
        description: '',
        priority: 'MEDIUM',
        tax_year: new Date().getFullYear().toString(),
        tax_office: 'LIRS - Head Office',
        initiated_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const loadTaxpayers = async () => {
            try {
                const data = await taxpayerService.getTaxpayers({ size: 100 });
                setTaxpayers(data.items);
            } catch (error) {
                console.error("Error loading taxpayers:", error);
            } finally {
                setTaxpayerLoading(false);
            }
        };
        loadTaxpayers();
    }, []);

    useEffect(() => {
        if (formData.taxpayer_id) {
            const loadFilings = async () => {
                try {
                    const data = await filingService.getFilings({ taxpayer_id: formData.taxpayer_id, size: 50 });
                    setFilings(data.items);
                } catch (error) {
                    console.error("Error loading filings:", error);
                }
            };
            loadFilings();
        } else {
            setFilings([]);
        }
    }, [formData.taxpayer_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await refundService.createRefund({
                ...formData,
                amount_claimed: parseFloat(formData.amount_claimed) || 0,
            });
            onSuccess();
        } catch (error) {
            console.error("Error initiating claim:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Taxpayer</label>
                    <select
                        required
                        value={formData.taxpayer_id}
                        onChange={(e) => setFormData({ ...formData, taxpayer_id: e.target.value })}
                        disabled={taxpayerLoading}
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green/30 transition-all font-medium text-sm"
                    >
                        <option value="">Select a taxpayer...</option>
                        {taxpayers.map(t => (
                            <option key={t.id} value={t.id}>{t.full_name} ({t.tin})</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Related Filing (Optional)</label>
                    <select
                        value={formData.filing_id}
                        onChange={(e) => setFormData({ ...formData, filing_id: e.target.value })}
                        disabled={!formData.taxpayer_id}
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green/30 transition-all font-medium text-sm"
                    >
                        <option value="">No specific filing...</option>
                        {filings.map(f => (
                            <option key={f.id} value={f.id}>{f.tax_type} - {f.period} ({f.submission_reference || 'Draft'})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Claim Amount (₦)"
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount_claimed}
                        onChange={(e) => setFormData({ ...formData, amount_claimed: e.target.value })}
                    />
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Priority</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green/30 transition-all font-medium text-sm"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>
                </div>

                <Input
                    label="Reason for Claim"
                    required
                    placeholder="e.g. Overpayment of PAYE in Q1 2024"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />

                <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Internal Reference / Description</label>
                    <textarea
                        rows={3}
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green/30 transition-all font-medium text-sm resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
            </div>

            <div className="pt-6 flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-ree-green text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-ree-light transition-all shadow-xl shadow-ree-green/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Initialize Claim
                </button>
            </div>
        </form>
    );
};

const RefundCases = () => {
    const [refunds, setRefunds] = useState([]);
    const [stats, setStats] = useState({ total_count: 0, initiated: 0, under_review: 0, total_approved_amount: 0 });
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ status: '', priority: '' });
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [documents, setDocuments] = useState([]);

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [listData, statsData] = await Promise.all([
                refundService.getRefunds({ page, search, ...filters }),
                refundService.getRefundStats()
            ]);
            setRefunds(listData.items);
            setTotalPages(listData.pages);
            setStats({
                total_count: statsData.total_cases || 0,
                initiated: statsData.by_status?.initiated || 0,
                under_review: statsData.by_status?.under_review || 0,
                total_approved_amount: statsData.total_amount_approved || 0
            });
        } catch (error) {
            console.error("Error fetching refunds:", error);
        } finally {
            setLoading(false);
        }
    }, [page, search, filters]);

    useEffect(() => {
        fetchData();
        if (location.state?.openNew) {
            setSelectedRefund(null);
            setIsPanelOpen(true);
        }
    }, [fetchData, location.state]);

    useEffect(() => {
        if (selectedRefund) {
            refundService.getRefundDocuments(selectedRefund.id).then(setDocuments).catch(console.error);
        } else {
            setDocuments([]);
        }
    }, [selectedRefund]);

    const handleAction = async (id, action, data = {}) => {
        try {
            setLoading(true);
            if (action === 'submit') await refundService.submitToTaxOffice(id, data);
            if (action === 'approve') await refundService.approveRefund(id, data);
            if (action === 'reject') await refundService.rejectRefund(id, data);
            if (action === 'disburse') await refundService.disburseRefund(id, data);
            await fetchData(true);
            setSelectedRefund(null);
        } catch (error) {
            console.error(`Error during ${action}:`, error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 italic tracking-tighter">Recovery Ledger</h1>
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
                    { label: 'Awaiting Initiation', value: stats.initiated, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Under Review', value: stats.under_review, icon: History, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Approved Recovery', value: stats.total_approved_amount, icon: Banknote, color: 'text-ree-green', bg: 'bg-emerald-50/50', isMoney: true },
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
            <div className="bg-white p-4 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-ree-green transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Case Number, Reason, or Taxpayer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-3xl text-sm font-medium focus:bg-white focus:border-ree-green/30 focus:ring-0 transition-all outline-none"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto px-2">
                    <select
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="flex-1 md:w-40 appearance-none bg-slate-50 border-transparent rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-ree-green/30 transition-all cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="initiated">Initiated</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="disbursed">Disbursed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
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
                                    <tr
                                        key={refund.id}
                                        className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                                        onClick={() => setSelectedRefund(refund)}
                                    >
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
                                                refund.priority === 'HIGH' || refund.priority === 'URGENT' ? 'bg-rose-50 text-rose-500 border-rose-100' :
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
                                        <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2 pr-2">
                                                {refund.status === 'initiated' && (
                                                    <button
                                                        onClick={() => handleAction(refund.id, 'submit', { submitted_date: new Date().toISOString().split('T')[0], tax_office_reference: `TR-${Math.random().toString(36).substr(2, 6).toUpperCase()}` })}
                                                        className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                        title="Submit to Tax Office"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {refund.status === 'under_review' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(refund.id, 'approve', { amount_approved: refund.amount_claimed, approval_date: new Date().toISOString().split('T')[0] })}
                                                            className="p-2 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                            title="Approve"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(refund.id, 'reject', { rejection_reason: 'Documentation discrepancy', rejection_date: new Date().toISOString().split('T')[0] })}
                                                            className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                            title="Reject"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {refund.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleAction(refund.id, 'disburse', { amount_disbursed: refund.amount_approved || refund.amount_claimed, disbursement_date: new Date().toISOString().split('T')[0] })}
                                                        className="p-2 rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                                        title="Mark as Disbursed"
                                                    >
                                                        <Banknote className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button className="p-2 rounded-xl border border-slate-100 hover:bg-slate-900 hover:text-white transition-all focus:scale-95">
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
                            className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all focus:scale-95"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all focus:scale-95"
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
                <RefundCaseForm
                    onSuccess={() => {
                        setIsPanelOpen(false);
                        fetchData();
                    }}
                    onCancel={() => setIsPanelOpen(false)}
                />
            </SidePanel>

            <SidePanel
                isOpen={!!selectedRefund}
                onClose={() => setSelectedRefund(null)}
                title="Recovery Case Details"
                subtitle={`Case ID: ${selectedRefund?.case_number}`}
            >
                {selectedRefund && (
                    <div className="p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <RefundStatusBadge status={selectedRefund.status} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Registered: {new Date(selectedRefund.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Taxpayer Entity</p>
                                <p className="text-lg font-black text-slate-900">{selectedRefund.taxpayer_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason for Claim</p>
                                <p className="text-lg font-black text-slate-900">{selectedRefund.reason}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jurisdiction</p>
                                <p className="text-lg font-black text-slate-900">{selectedRefund.tax_office}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority Level</p>
                                <p className="text-lg font-black text-slate-900 italic">{selectedRefund.priority}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Claimed</p>
                                <p className="text-xl font-black text-slate-900 tracking-tighter">₦{parseFloat(selectedRefund.amount_claimed).toLocaleString()}</p>
                            </div>
                            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-100">
                                <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Approved</p>
                                <p className="text-xl font-black text-emerald-600 tracking-tighter">₦{parseFloat(selectedRefund.amount_approved || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-5 rounded-3xl bg-ree-green border border-ree-green/20">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Disbursed</p>
                                <p className="text-xl font-black text-white tracking-tighter">₦{parseFloat(selectedRefund.amount_disbursed || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        {selectedRefund.description && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Narrative</p>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-3xl italic">
                                    "{selectedRefund.description}"
                                </p>
                            </div>
                        )}

                        <div className="space-y-4 pt-8 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence & Documents</p>
                                <button
                                    onClick={() => document.getElementById('doc-upload').click()}
                                    className="text-[10px] font-black text-ree-green uppercase tracking-widest flex items-center gap-1"
                                >
                                    Upload Proof <Plus className="w-3 h-3" />
                                </button>
                                <input
                                    id="doc-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            formData.append('document_type', 'SUPPORTING_EVIDENCE');
                                            try {
                                                await refundService.addRefundDocument(selectedRefund.id, formData);
                                                const data = await refundService.getRefundDocuments(selectedRefund.id);
                                                setDocuments(data);
                                            } catch (err) {
                                                console.error("Upload failed", err);
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {documents.length > 0 ? documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200">
                                                <FileText className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 truncate max-w-[200px]">{doc.file_name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.file_size_kb} KB • {doc.document_type?.replace(/_/g, ' ')}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-slate-400 hover:text-ree-green transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                )) : (
                                    <p className="text-[10px] font-bold text-slate-400 italic py-4">No supporting evidence provided.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Timeline</p>
                                <button className="text-[10px] font-black text-ree-green uppercase tracking-widest flex items-center gap-1">
                                    Full History <ArrowUpRight className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900">Case Initialized</p>
                                        <p className="text-[10px] font-bold text-slate-400 tracking-wide mt-0.5">{new Date(selectedRefund.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                {selectedRefund.submitted_date && (
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                            <Send className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">Submitted to Tax Office</p>
                                            <p className="text-[10px] font-bold text-slate-400 tracking-wide mt-0.5">{new Date(selectedRefund.submitted_date).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </SidePanel>
        </div>
    );
};

export default RefundCases;
