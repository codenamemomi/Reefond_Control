import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    UserCheck,
    Building,
    Calendar,
    Loader2,
    AlertCircle,
    ChevronRight,
    Briefcase,
    SearchX
} from 'lucide-react';
import { taxpayerService } from '../../api/taxpayers';
import { motion } from 'framer-motion';
import SidePanel from '../../components/ui/SidePanel';
import Input from '../../components/ui/Input';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

const TaxTypeBadge = ({ type }) => {
    const styles = {
        PAYE: "bg-blue-50 text-blue-600 border-blue-100",
        VAT: "bg-purple-50 text-purple-600 border-purple-100",
        CIT: "bg-orange-50 text-orange-600 border-orange-100",
        WHT: "bg-rose-50 text-rose-600 border-rose-100",
        PIT: "bg-indigo-50 text-indigo-600 border-indigo-100",
    };
    return (
        <span className={clsx(
            "px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider border",
            styles[type] || "bg-slate-50 text-slate-600 border-slate-100"
        )}>
            {type}
        </span>
    );
};

const Taxpayers = () => {
    const navigate = useNavigate();
    const [taxpayers, setTaxpayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [filters, setFilters] = useState({
        state: '',
        tax_type: '',
        status: ''
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        pending: 0,
        compliant_rate: 0
    });
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const canManageTaxpayers = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';

    const [newTaxpayer, setNewTaxpayer] = useState({
        full_name: '',
        tin: '',
        bvn: '',
        nin: '',
        email: '',
        phone_number: '',
        address: '',
        city: '',
        state: 'Lagos',
        tax_type: 'PAYE',
        business_name: '',
        rc_number: '',
        business_type: '',
        industry: '',
        employment_status: 'Employed',
        job_title: '',
        is_resident: true,
        has_worldwide_income: false
    });

    const [formStep, setFormStep] = useState(1);

    const fetchTaxpayers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await taxpayerService.getTaxpayers({
                ...filters,
                search: searchTerm,
                skip: (page - 1) * limit,
                limit: limit
            });
            setTaxpayers(data.items || []);
            setTotalPages(Math.ceil((data.total || 0) / limit));
            setError('');
        } catch (err) {
            setError('Failed to load taxpayers. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters, searchTerm, page]);

    const fetchStats = useCallback(async () => {
        setIsStatsLoading(true);
        try {
            const data = await taxpayerService.getTaxpayerStats();
            // Map backend keys to frontend state
            setStats({
                total: data.total || 0,
                verified: data.verified || 0,
                pending: (data.by_status?.pending || data.by_status?.PENDING) || 0,
                compliant_rate: Math.round(data.verification_rate || 0)
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setIsStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTaxpayers();
        fetchStats();
    }, [fetchTaxpayers, fetchStats]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTaxpayers();
    };

    const handleCreateTaxpayer = async (e) => {
        e.preventDefault();
        try {
            setIsCreating(true);
            await taxpayerService.createTaxpayer(newTaxpayer);
            setIsModalOpen(false);
            fetchTaxpayers();
            // Reset form
            setNewTaxpayer({
                full_name: '',
                tin: '',
                bvn: '',
                nin: '',
                email: '',
                phone_number: '',
                address: '',
                city: '',
                state: 'Lagos',
                tax_type: 'PAYE',
                business_name: '',
                rc_number: '',
                business_type: '',
                industry: '',
                employment_status: 'Employed',
                job_title: '',
                is_resident: true,
                has_worldwide_income: false
            });
            setFormStep(1);
        } catch (err) {
            console.error(err);
            alert('Failed to create taxpayer. Please verify all fields.');
        } finally {
            setIsCreating(false);
        }
    };

    const states = [
        "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
        "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
        "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
        "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
        "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Taxpayers Directory</h1>
                    <p className="text-slate-500 font-medium">Global registry of individuals and corporate tax entities.</p>
                </div>
                <div className="flex items-center gap-3">
                    {!canManageTaxpayers ? (
                        <div className="flex items-center gap-3 opacity-60 grayscale blur-[1px] pointer-events-none" title="Unauthorized: Accountant/Admin only">
                            <Plus className="w-5 h-5 text-slate-400" />
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Register Taxpayer</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-ree-green text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-ree-light transition-all shadow-xl shadow-ree-green/20 active:scale-95 whitespace-nowrap text-sm uppercase tracking-widest"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Register Taxpayer</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Overview (Subtle) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    {
                        label: 'Total Enrolled',
                        value: stats.total.toLocaleString(),
                        icon: Users,
                        color: 'bg-indigo-50 text-indigo-500'
                    },
                    {
                        label: 'Verified Entities',
                        value: stats.verified.toLocaleString(),
                        icon: UserCheck,
                        color: 'bg-emerald-50 text-emerald-500'
                    },
                    {
                        label: 'Pending Review',
                        value: stats.pending.toLocaleString(),
                        icon: Loader2,
                        color: 'bg-amber-50 text-amber-500'
                    },
                    {
                        label: 'Compliant Rate',
                        value: `${stats.compliant_rate}%`,
                        icon: Briefcase,
                        color: 'bg-blue-50 text-blue-500'
                    }
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-white rounded-[2rem] border border-slate-50 flex items-center gap-6 shadow-sm">
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center", stat.color)}>
                            <stat.icon className={clsx("w-6 h-6", stat.label === 'Pending Review' && isStatsLoading && "animate-spin")} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{isStatsLoading ? '...' : stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters bar */}
            <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-2">
                <form onSubmit={handleSearch} className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-ree-green transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by Name, TIN or RC Number..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-2xl focus:bg-white outline-none transition-all font-medium text-sm focus:ring-4 focus:ring-ree-green/5 border border-transparent focus:border-ree-green/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
                <div className="flex flex-wrap items-center gap-2 p-1">
                    <select
                        className="px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-ree-green/20"
                        value={filters.state}
                        onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                    >
                        <option value="">All States</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                        className="px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-ree-green/20"
                        value={filters.tax_type}
                        onChange={(e) => setFilters({ ...filters, tax_type: e.target.value })}
                    >
                        <option value="">Tax Type</option>
                        <option value="PAYE">PAYE</option>
                        <option value="VAT">VAT</option>
                        <option value="CIT">CIT</option>
                        <option value="WHT">WHT</option>
                    </select>
                    <button className="p-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-32 flex flex-col items-center gap-6">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 text-ree-green animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Users className="w-6 h-6 text-ree-green/40" />
                            </div>
                        </div>
                        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Syncing Directory...</p>
                    </div>
                ) : error ? (
                    <div className="p-32 flex flex-col items-center gap-4 text-center">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">{error}</h3>
                        <button onClick={fetchTaxpayers} className="text-ree-green font-bold hover:underline">Retry Connection</button>
                    </div>
                ) : taxpayers.length === 0 ? (
                    <div className="p-32 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 rotate-12">
                            <SearchX className="w-12 h-12 text-slate-300 -rotate-12" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">No results found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium">We couldn't find any taxpayers matching your current search or filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100">Taxpayer Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100 text-center">TIN</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100">State / Region</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100">Classification</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100 text-right">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {taxpayers.map((tp, idx) => (
                                    <motion.tr
                                        key={tp.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-slate-50/70 transition-all cursor-pointer group"
                                        onClick={() => navigate(`/dashboard/taxpayers/${tp.id}`)}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-ree-green/10 transition-colors">
                                                    {tp.is_company ? (
                                                        <Building className="w-7 h-7 text-slate-400 group-hover:text-ree-green transition-colors" />
                                                    ) : (
                                                        <Users className="w-7 h-7 text-slate-400 group-hover:text-ree-green transition-colors" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 leading-tight mb-1">{tp.full_name}</p>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{tp.business_name || 'Individual'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="font-mono text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                {tp.tin || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                <p className="text-sm font-bold text-slate-700">{tp.state}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <TaxTypeBadge type={tp.tax_type} />
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={clsx(
                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                tp.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            )}>
                                                <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", tp.status === 'active' ? "bg-emerald-500" : "bg-rose-500")} />
                                                {tp.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-300 group-hover:text-ree-green group-hover:border-ree-green/20 group-hover:shadow-md transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Footer */}
                        <div className="p-8 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Page <span className="text-slate-900">{page}</span> of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-slate-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-slate-800"
                                >
                                    Next Page
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Register Taxpayer Side Panel */}
            <SidePanel
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFormStep(1);
                }}
                title="Formal Taxpayer Registration"
                size="md"
            >
                <div className="mb-8 flex items-center gap-2">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex-1 flex items-center gap-2">
                            <div className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                                formStep === step ? "bg-ree-green text-white shadow-lg shadow-ree-green/20" :
                                    formStep > step ? "bg-ree-green/10 text-ree-green" : "bg-slate-100 text-slate-400"
                            )}>
                                {formStep > step ? <UserCheck className="w-4 h-4" /> : step}
                            </div>
                            <div className={clsx("flex-1 h-1 rounded-full", formStep > step ? "bg-ree-green/10" : "bg-slate-100")} />
                        </div>
                    ))}
                </div>

                <form onSubmit={handleCreateTaxpayer} className="space-y-6">
                    {formStep === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name / Primary Identity"
                                    placeholder="e.g. John Doe / Acme Corp"
                                    required
                                    value={newTaxpayer.full_name}
                                    onChange={(e) => setNewTaxpayer({ ...newTaxpayer, full_name: e.target.value })}
                                />
                                <Input
                                    label="Tax Identification Number (TIN)"
                                    placeholder="10-12 digits"
                                    value={newTaxpayer.tin}
                                    onChange={(e) => setNewTaxpayer({ ...newTaxpayer, tin: e.target.value })}
                                />
                                <Input
                                    label="Bank Verification Number (BVN)"
                                    placeholder="11 digits"
                                    value={newTaxpayer.bvn}
                                    onChange={(e) => setNewTaxpayer({ ...newTaxpayer, bvn: e.target.value })}
                                />
                                <Input
                                    label="National ID Number (NIN)"
                                    placeholder="11 digits"
                                    value={newTaxpayer.nin}
                                    onChange={(e) => setNewTaxpayer({ ...newTaxpayer, nin: e.target.value })}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormStep(2)}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                            >
                                Continue to Contact Info
                            </button>
                        </motion.div>
                    )}

                    {formStep === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={newTaxpayer.email}
                                    onChange={(e) => setNewTaxpayer({ ...newTaxpayer, email: e.target.value })}
                                />
                                <Input
                                    label="Phone Number"
                                    placeholder="+234..."
                                    value={newTaxpayer.phone_number}
                                    onChange={(e) => setNewTaxpayer({ ...newTaxpayer, phone_number: e.target.value })}
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="Residential / Business Address"
                                        placeholder="Full street address"
                                        value={newTaxpayer.address}
                                        onChange={(e) => setNewTaxpayer({ ...newTaxpayer, address: e.target.value })}
                                    />
                                </div>
                                <Input
                                    label="City"
                                    placeholder="City name"
                                    value={newTaxpayer.city}
                                    onChange={(e) => setNewTaxpayer({ ...newTaxpayer, city: e.target.value })}
                                />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                                    <select
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm"
                                        value={newTaxpayer.state}
                                        onChange={(e) => setNewTaxpayer({ ...newTaxpayer, state: e.target.value })}
                                    >
                                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setFormStep(1)} className="flex-1 py-5 border-2 border-slate-100 rounded-2xl font-black text-slate-400 text-[10px] uppercase tracking-widest">Back</button>
                                <button type="button" onClick={() => setFormStep(3)} className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">Continue to Tax Profile</button>
                            </div>
                        </motion.div>
                    )}

                    {formStep === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Classification</label>
                                    <select
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm"
                                        value={newTaxpayer.tax_type}
                                        onChange={(e) => setNewTaxpayer({ ...newTaxpayer, tax_type: e.target.value })}
                                    >
                                        <option value="PAYE">PAYE (Personal)</option>
                                        <option value="VAT">VAT (Value Added)</option>
                                        <option value="CIT">CIT (Corporate)</option>
                                        <option value="WHT">WHT (Withholding)</option>
                                    </select>
                                </div>
                                <Input
                                    label="Business Name (If applicable)"
                                    placeholder="Legal Entity Name"
                                    value={newTaxpayer.business_name}
                                    onChange={(e) => setNewTaxpayer({ ...newTaxpayer, business_name: e.target.value })}
                                />
                                <Input
                                    label="RC Number / Business Reg"
                                    placeholder="RC, BN or IT number"
                                    value={newTaxpayer.rc_number}
                                    onChange={(e) => setNewTaxpayer({ ...newTaxpayer, rc_number: e.target.value })}
                                />
                                <Input
                                    label="Industry / Sector"
                                    placeholder="e.g. Fintech, Retail"
                                    value={newTaxpayer.industry}
                                    onChange={(e) => setNewTaxpayer({ ...newTaxpayer, industry: e.target.value })}
                                />
                            </div>

                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600">Resident for Tax Purposes?</span>
                                    <button
                                        type="button"
                                        onClick={() => setNewTaxpayer({ ...newTaxpayer, is_resident: !newTaxpayer.is_resident })}
                                        className={clsx("w-12 h-6 rounded-full transition-all relative", newTaxpayer.is_resident ? "bg-ree-green" : "bg-slate-200")}
                                    >
                                        <div className={clsx("w-4 h-4 bg-white rounded-full absolute top-1 transition-all", newTaxpayer.is_resident ? "right-1" : "left-1")} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600">Has Worldwide Income?</span>
                                    <button
                                        type="button"
                                        onClick={() => setNewTaxpayer({ ...newTaxpayer, has_worldwide_income: !newTaxpayer.has_worldwide_income })}
                                        className={clsx("w-12 h-6 rounded-full transition-all relative", newTaxpayer.has_worldwide_income ? "bg-ree-green" : "bg-slate-200")}
                                    >
                                        <div className={clsx("w-4 h-4 bg-white rounded-full absolute top-1 transition-all", newTaxpayer.has_worldwide_income ? "right-1" : "left-1")} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setFormStep(2)} className="flex-1 py-5 border-2 border-slate-100 rounded-2xl font-black text-slate-400 text-[10px] uppercase tracking-widest">Back</button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-[2] py-5 bg-ree-green text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-ree-green/30 hover:bg-ree-light transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>
            </SidePanel>
        </div>
    );
};

export default Taxpayers;
