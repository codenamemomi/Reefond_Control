import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Building,
    Mail,
    Phone,
    MapPin,
    Shield,
    Calendar,
    Briefcase,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Clock,
    FileText,
    TrendingUp,
    ExternalLink
} from 'lucide-react';
import { taxpayerService } from '../../api/taxpayers';
import { clsx } from 'clsx';

const InformationCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value, highlight = false }) => (
    <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={clsx(
            "text-base font-bold",
            highlight ? "text-ree-green" : "text-slate-700"
        )}>
            {value || 'Not Provided'}
        </p>
    </div>
);

const TaxpayerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [taxpayer, setTaxpayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTaxpayer = useCallback(async () => {
        try {
            setLoading(true);
            const data = await taxpayerService.getTaxpayerById(id);
            setTaxpayer(data);
        } catch (err) {
            setError('Could not retrieve taxpayer details. The ID may be invalid.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTaxpayer();
    }, [fetchTaxpayer]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-ree-green animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Entity Profile...</p>
            </div>
        );
    }

    if (error || !taxpayer) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Data Retrieval Error</h2>
                    <p className="text-slate-500 max-w-sm">{error || "The taxpayer profile could not be found."}</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/taxpayers')}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
                >
                    Back to Directory
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Breadcrumbs & Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/dashboard/taxpayers')}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-slate-50 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">Back to Directory</span>
                </button>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">
                        Export Profile
                    </button>
                    {!taxpayer.is_verified && (
                        <button
                            onClick={async () => {
                                try {
                                    await taxpayerService.verifyTaxpayer(id);
                                    fetchTaxpayer();
                                } catch {
                                    alert('Verification failed');
                                }
                            }}
                            className="px-6 py-3 bg-ree-green text-white rounded-xl font-black hover:bg-ree-light transition-all text-xs uppercase tracking-widest shadow-lg shadow-ree-green/20"
                        >
                            Verify Entity
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 relative overflow-hidden text-white shadow-2xl shadow-slate-900/20">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Shield className="w-64 h-64 rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                        <Building className="w-16 h-16 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-ree-green text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                                {taxpayer.tax_type} Classification
                            </span>
                            <span className={clsx(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                taxpayer.is_verified ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                            )}>
                                {taxpayer.is_verified ? 'Verified Entity' : 'Verification Pending'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 italic uppercase">{taxpayer.full_name}</h1>
                        <p className="text-slate-400 font-bold text-lg flex items-center gap-2">
                            <Shield className="w-5 h-5 text-ree-green" />
                            TIN: <span className="text-white font-mono">{taxpayer.tin || 'NOT ASSIGNED'}</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-14 pt-10 border-t border-white/10">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Current Status</p>
                        <p className="text-xl font-black capitalize flex items-center gap-2">
                            <div className={clsx("w-2 h-2 rounded-full animate-pulse", taxpayer.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400')} />
                            {taxpayer.status}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Enrolled Since</p>
                        <p className="text-xl font-black">{new Date(taxpayer.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Region</p>
                        <p className="text-xl font-black">{taxpayer.state}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Risk Score</p>
                        <p className="text-xl font-black text-ree-green">Low Risk</p>
                    </div>
                </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Info */}
                <div className="lg:col-span-2 space-y-8">
                    <InformationCard title="Identity & Governance" icon={Shield}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <DetailItem label="Full Legal Name" value={taxpayer.full_name} highlight />
                            <DetailItem label="Business Name" value={taxpayer.business_name} />
                            <DetailItem label="Registration Number (RC)" value={taxpayer.rc_number} />
                            <DetailItem label="Tax Identity (TIN)" value={taxpayer.tin} highlight />
                            <DetailItem label="BVN Linked" value={taxpayer.bvn_linked ? 'Yes' : 'No'} />
                            <DetailItem label="NIN Linked" value={taxpayer.nin_linked ? 'Yes' : 'No'} />
                        </div>
                    </InformationCard>

                    <InformationCard title="Contact & Locality" icon={MapPin}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <DetailItem label="Physical Address" value={taxpayer.address} />
                            </div>
                            <DetailItem label="City" value={taxpayer.city} />
                            <DetailItem label="State" value={taxpayer.state} />
                            <DetailItem label="Email Address" value={taxpayer.email} />
                            <DetailItem label="Phone Line" value={taxpayer.phone_number} />
                        </div>
                    </InformationCard>

                    <InformationCard title="Employment & Industry" icon={Briefcase}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <DetailItem label="Employment Status" value={taxpayer.employment_status} />
                            <DetailItem label="Job Title" value={taxpayer.job_title} />
                            <DetailItem label="Industry Sector" value={taxpayer.industry} />
                            <DetailItem label="Employer Entity" value={taxpayer.employer?.name || 'Self-Employed / Independent'} />
                        </div>
                    </InformationCard>
                </div>

                {/* Right Column: Activity & Summary */}
                <div className="space-y-8">
                    <InformationCard title="Compliance Health" icon={CheckCircle2}>
                        <div className="flex flex-col items-center py-6 text-center">
                            <div className="w-24 h-24 rounded-full border-8 border-slate-50 flex items-center justify-center mb-4 relative">
                                <div className="absolute inset-0 rounded-full border-8 border-ree-green border-t-transparent -rotate-45" />
                                <span className="text-2xl font-black text-slate-900">85%</span>
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Health Grade</p>
                            <p className="text-sm font-bold text-ree-green">Excellent Standing</p>
                        </div>
                        <div className="pt-6 border-t border-slate-50 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Filings Complete</span>
                                <span className="text-xs font-black text-slate-900">{taxpayer.filing_count} Successes</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Active Refunds</span>
                                <span className="text-xs font-black text-slate-900">{taxpayer.active_refund_cases} Open Cases</span>
                            </div>
                        </div>
                    </InformationCard>

                    <InformationCard title="Recent Footprints" icon={Clock}>
                        <div className="space-y-6">
                            {[
                                { status: 'Success', action: 'PAYE Filing Submission', date: 'Oct 24, 2023', icon: FileText, color: 'blue' },
                                { status: 'Alert', action: 'TIN Verification Request', date: 'Sept 12, 2023', icon: Shield, color: 'orange' },
                                { status: 'Success', action: 'Registration Created', date: 'Aug 05, 2023', icon: CheckCircle2, color: 'emerald' },
                            ].map((activity, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className={`w-8 h-8 rounded-lg bg-${activity.color}-50 text-${activity.color}-500 flex items-center justify-center shrink-0`}>
                                        <activity.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 leading-tight mb-1">{activity.action}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-400">{activity.date}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className={`text-[10px] font-black uppercase text-${activity.color}-600`}>{activity.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all">
                            View Full Audit Trail
                        </button>
                    </InformationCard>
                </div>
            </div>
        </div>
    );
};

export default TaxpayerDetails;
