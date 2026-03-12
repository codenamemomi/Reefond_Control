import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
    ArrowUpRight,
    X,
    Check,
    Ban,
    FileUp
} from 'lucide-react';
import { filingService } from '../../api/filings';
import { taxpayerService } from '../../api/taxpayers';
import { clsx } from 'clsx';
import SidePanel from '../../components/ui/SidePanel';
import Input from '../../components/ui/Input';

const FilingStatusBadge = ({ status }) => {
    const styles = {
        DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
        SUBMITTED: "bg-blue-50 text-blue-600 border-blue-100",
        ACKNOWLEDGED: "bg-emerald-50 text-emerald-600 border-emerald-100",
        REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
        OVERDUE: "bg-amber-50 text-amber-600 border-amber-100",
        PROCESSING: "bg-indigo-50 text-indigo-600 border-indigo-100",
        COMPLETED: "bg-ree-green/10 text-ree-green border-ree-green/20",
        PENDING_REVIEW: "bg-violet-50 text-violet-600 border-violet-100",
    };
    return (
        <span className={clsx(
            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
            styles[status.toUpperCase()] || styles.DRAFT
        )}>
            {status.replace('_', ' ')}
        </span>
    );
};

const FilingForm = ({ onSuccess, onCancel }) => {
    const [taxpayers, setTaxpayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [taxpayerLoading, setTaxpayerLoading] = useState(true);
    const [formData, setFormData] = useState({
        taxpayer_id: '',
        tax_type: 'PAYE',
        period: '',
        period_type: 'monthly',
        due_date: '',
        state: 'LAGOS',
        amount_payable: '',
        submission_method: 'manual',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await filingService.createFiling({
                ...formData,
                amount_payable: parseFloat(formData.amount_payable) || 0,
            });
            onSuccess();
        } catch (error) {
            console.error("Error creating filing:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Select Taxpayer</label>
                    <select
                        required
                        value={formData.taxpayer_id}
                        onChange={(e) => setFormData({ ...formData, taxpayer_id: e.target.value })}
                        disabled={taxpayerLoading}
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green/30 transition-all font-medium text-sm"
                    >
                        <option value="">Choose a taxpayer...</option>
                        {taxpayers.map(t => (
                            <option key={t.id} value={t.id}>{t.full_name} ({t.tin})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Tax Type</label>
                        <select
                            value={formData.tax_type}
                            onChange={(e) => setFormData({ ...formData, tax_type: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green/30 transition-all font-medium text-sm"
                        >
                            <option value="PAYE">PAYE</option>
                            <option value="VAT">VAT</option>
                            <option value="CIT">CIT</option>
                            <option value="WHT">WHT</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Period Type</label>
                        <select
                            value={formData.period_type}
                            onChange={(e) => setFormData({ ...formData, period_type: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green/30 transition-all font-medium text-sm"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annually">Annually</option>
                        </select>
                    </div>
                </div>

                <Input
                    label="Period (YYYY-MM or YYYY-Qx)"
                    placeholder={formData.period_type === 'monthly' ? "2025-01" : "2025-Q1"}
                    required
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Due Date"
                        type="date"
                        required
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                    <Input
                        label="Amount Payable (₦)"
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount_payable}
                        onChange={(e) => setFormData({ ...formData, amount_payable: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Jurisdiction (State)</label>
                    <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green/30 transition-all font-medium text-sm"
                    >
                        <option value="LAGOS">Lagos</option>
                        <option value="ABUJA">Abuja (FCT)</option>
                        <option value="RIVERS">Rivers</option>
                        <option value="KANO">Kano</option>
                    </select>
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
                    Initialize Record
                </button>
            </div>
        </form>
    );
};

const Filings = () => {
    const [filings, setFilings] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, acknowledged: 0, late: 0 });
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ status: '', tax_type: '', state: '' });
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedFiling, setSelectedFiling] = useState(null);
    const [attachments, setAttachments] = useState([]);

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [listData, statsData] = await Promise.all([
                filingService.getFilings({ page, search, ...filters }),
                filingService.getFilingStats()
            ]);
            setFilings(listData.items);
            setTotalPages(listData.pages);
            setStats({
                total: statsData.total || 0,
                pending: statsData.by_status?.submitted || 0,
                acknowledged: statsData.by_status?.acknowledged || 0,
                late: statsData.late_filings_count || 0
            });
        } catch (error) {
            console.error("Error fetching filings:", error);
        } finally {
            setLoading(false);
        }
    }, [page, search, filters]);

    useEffect(() => {
        fetchData();
        if (location.state?.openNew) {
            setSelectedFiling(null);
            setIsPanelOpen(true);
        }
    }, [fetchData, location.state]);

    const handleAction = async (id, action, data = {}) => {
        try {
            setLoading(true);
            if (action === 'verify') await filingService.verifyFiling(id, data);
            if (action === 'reject') await filingService.rejectFiling(id, data);
            if (action === 'submit') await filingService.submitFiling(id, data);
            await fetchData(true);
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
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 italic tracking-tighter">Filings Ledger</h1>
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
                    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
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
            <div className="bg-white p-4 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-ree-green transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by Reference, Taxpayer, or TIN..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-3xl text-sm font-medium focus:bg-white focus:border-ree-green/30 focus:ring-0 transition-all outline-none"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto px-2">
                    <select
                        onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
                        className="flex-1 md:w-40 appearance-none bg-slate-50 border-transparent rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-ree-green/30 transition-all cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <select
                        onChange={(e) => setFilters(p => ({ ...p, tax_type: e.target.value }))}
                        className="flex-1 md:w-40 appearance-none bg-slate-50 border-transparent rounded-2xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-ree-green/30 transition-all cursor-pointer"
                    >
                        <option value="">Tax Type</option>
                        <option value="PAYE">PAYE</option>
                        <option value="VAT">VAT</option>
                        <option value="CIT">CIT</option>
                        <option value="WHT">WHT</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
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
                                    <tr
                                        key={filing.id}
                                        className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                                        onClick={() => setSelectedFiling(filing)}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 tracking-tight group-hover:text-ree-green transition-colors">{filing.submission_reference || 'DRAFT_RECORD'}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{filing.taxpayer_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-ree-green" />
                                                <span className="text-xs font-black text-slate-600 tracking-tight">{filing.tax_type}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-slate-500">{filing.period}</span>
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
                                        <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2 pr-2">
                                                {filing.status === 'draft' && (
                                                    <button
                                                        onClick={() => handleAction(filing.id, 'submit', { filing_date: new Date().toISOString().split('T')[0], submission_reference: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}` })}
                                                        className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                        title="Submit Filing"
                                                    >
                                                        <FileUp className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {filing.status === 'submitted' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(filing.id, 'verify', { verification_notes: 'Verified via automated dashboard control.' })}
                                                            className="p-2 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                            title="Acknowledge"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(filing.id, 'reject', { rejection_reason: 'Documentation discrepancy identified.' })}
                                                            className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                            title="Reject"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
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
                title="Register New Filing"
                subtitle="Formal tax submission record initialization."
            >
                <FilingForm
                    onSuccess={() => {
                        setIsPanelOpen(false);
                        fetchData();
                    }}
                    onCancel={() => setIsPanelOpen(false)}
                />
            </SidePanel>

            <SidePanel
                isOpen={!!selectedFiling}
                onClose={() => setSelectedFiling(null)}
                title="Filing Detail View"
                subtitle={`Ref: ${selectedFiling?.submission_reference || 'DRAFT'}`}
            >
                {selectedFiling && (
                    <div className="p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <FilingStatusBadge status={selectedFiling.status} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Created: {new Date(selectedFiling.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Taxpayer</p>
                                <p className="text-lg font-black text-slate-900">{selectedFiling.taxpayer_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State/Jurisdiction</p>
                                <p className="text-lg font-black text-slate-900">{selectedFiling.state}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period</p>
                                <p className="text-lg font-black text-slate-900">{selectedFiling.period}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax Type</p>
                                <p className="text-lg font-black text-slate-900">{selectedFiling.tax_type}</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount Payable</p>
                                <p className="text-2xl font-black text-slate-900">₦{parseFloat(selectedFiling.amount_payable).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount Paid</p>
                                <p className="text-2xl font-black text-ree-green">₦{parseFloat(selectedFiling.amount_paid || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        {selectedFiling.submission_reference && (
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submission Reference</p>
                                <div className="p-4 bg-slate-900 text-white rounded-2xl font-mono text-xs flex items-center justify-between">
                                    {selectedFiling.submission_reference}
                                    <ArrowUpRight className="w-4 h-4 text-ree-green" />
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 pt-8 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attachments</p>
                                <button
                                    onClick={() => document.getElementById('file-upload').click()}
                                    className="text-[10px] font-black text-ree-green uppercase tracking-widest flex items-center gap-1"
                                >
                                    Add Document <Plus className="w-3 h-3" />
                                </button>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            formData.append('file_type', 'SUPPORTING_DOCUMENT');
                                            try {
                                                await filingService.addAttachment(selectedFiling.id, formData);
                                                // Refresh attachments
                                                const data = await filingService.getAttachments(selectedFiling.id);
                                                setAttachments(data);
                                            } catch (err) {
                                                console.error("Upload failed", err);
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {attachments.length > 0 ? attachments.map((att) => (
                                    <div key={att.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200">
                                                <FileText className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 truncate max-w-[200px]">{att.file_name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{att.file_size_kb} KB • {att.file_type?.replace(/_/g, ' ')}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={att.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-slate-400 hover:text-ree-green transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                )) : (
                                    <p className="text-[10px] font-bold text-slate-400 italic py-4">No documents attached.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Information</p>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 font-medium">Initialized By</span>
                                    <span className="font-black text-slate-700">{selectedFiling.created_by_name || 'System Administrator'}</span>
                                </div>
                                {selectedFiling.verified_by_name && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-medium">Verified By</span>
                                        <span className="font-black text-emerald-500">{selectedFiling.verified_by_name}</span>
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

export default Filings;
