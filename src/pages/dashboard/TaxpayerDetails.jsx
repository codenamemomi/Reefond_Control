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
    AlertTriangle,
    ExternalLink,
    X,
    Save,
    Pencil
} from 'lucide-react';
import { taxpayerService } from '../../api/taxpayers';
import { complianceService } from '../../api/compliance';
import { filingService } from '../../api/filings';
import { refundService } from '../../api/refunds';
import { clsx } from 'clsx';
import SidePanel from '../../components/ui/SidePanel';
import Input from '../../components/ui/Input';

const InformationCard = (props) => {
    const Icon = props.icon;
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{props.title}</h3>
            </div>
            <div className="space-y-4">
                {props.children}
            </div>
        </div>
    );
};

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
    const [footprints, setFootprints] = useState([]);
    const [compliance, setCompliance] = useState(null);
    const [recentFilings, setRecentFilings] = useState([]);
    const [recentRefunds, setRecentRefunds] = useState([]);
    const [unresolvedAlerts, setUnresolvedAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editLoading, setEditLoading] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [error, setError] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    const fetchTaxpayer = useCallback(async () => {
        try {
            setLoading(true);
            const [data, footprintsData, complianceData, filingsData, refundsData, alertsData] = await Promise.all([
                taxpayerService.getTaxpayerById(id),
                taxpayerService.getTaxpayerFootprints(id).catch(() => []),
                complianceService.getTaxpayerScore(id).catch(() => null),
                filingService.getFilings({ taxpayer_id: id, size: 5 }).catch(() => ({ items: [] })),
                refundService.getRefunds({ taxpayer_id: id, size: 5 }).catch(() => ({ items: [] })),
                complianceService.getAlerts({ taxpayer_id: id, is_resolved: false }).catch(() => [])
            ]);
            setTaxpayer(data);
            setFootprints(footprintsData);
            setCompliance(complianceData);
            setRecentFilings(filingsData.items);
            setRecentRefunds(refundsData.items);
            setUnresolvedAlerts(alertsData);
        } catch (err) {
            setError('Could not retrieve taxpayer details. The ID may be invalid.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const getActionDisplay = (action) => {
        const mappings = {
            'create': { label: 'Entity Created', icon: FileText, color: 'emerald', status: 'Success' },
            'update': { label: 'Profile Updated', icon: FileText, color: 'blue', status: 'Update' },
            'verify': { label: 'Entity Verified', icon: Shield, color: 'indigo', status: 'Verified' },
            'soft_delete': { label: 'Entity Deleted', icon: AlertCircle, color: 'rose', status: 'Removed' },
            'bulk_create': { label: 'Bulk Import Created', icon: FileText, color: 'emerald', status: 'Imported' }
        };
        return mappings[action] || { label: action.replace('_', ' '), icon: Clock, color: 'slate', status: 'Activity' };
    };

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
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                        <Pencil className="w-3 h-3" />
                        Edit Profile
                    </button>
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
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 italic uppercase flex flex-wrap items-center gap-4">
                            {taxpayer.full_name}
                            {unresolvedAlerts.length > 0 && (
                                <div className="flex items-center gap-1.5 bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-rose-500/30 animate-pulse normal-case italic-none tracking-widest">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {unresolvedAlerts.length} Critical Issues
                                </div>
                            )}
                        </h1>
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
                        <p className={clsx(
                            "text-xl font-black capitalize",
                            taxpayer.risk_level === 'low' ? 'text-emerald-400' :
                                taxpayer.risk_level === 'high' ? 'text-rose-400' : 'text-amber-400'
                        )}>
                            {taxpayer.risk_level || 'Calculating...'}
                        </p>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InformationCard title="Recent Filings" icon={FileText}>
                            <div className="space-y-4">
                                {recentFilings.length > 0 ? recentFilings.map(filing => (
                                    <div key={filing.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-ree-green/30 transition-all cursor-pointer" onClick={() => navigate(`/dashboard/filings?taxpayer_id=${id}`)}>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{filing.tax_type} - {filing.period}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(filing.due_date).toLocaleDateString()}</p>
                                        </div>
                                        <span className={clsx(
                                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                                            filing.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                filing.status === 'overdue' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                        )}>{filing.status}</span>
                                    </div>
                                )) : (
                                    <p className="text-xs font-bold text-slate-400 italic py-2">No filing records found.</p>
                                )}
                                <button onClick={() => navigate(`/dashboard/filings?taxpayer_id=${id}`)} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-ree-green hover:underline">View All Filings</button>
                            </div>
                        </InformationCard>

                        <InformationCard title="Refund Cases" icon={TrendingUp}>
                            <div className="space-y-4">
                                {recentRefunds.length > 0 ? recentRefunds.map(refund => (
                                    <div key={refund.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-ree-green/30 transition-all cursor-pointer" onClick={() => navigate(`/dashboard/refunds?taxpayer_id=${id}`)}>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">₦{parseFloat(refund.amount_claimed).toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{refund.case_number}</p>
                                        </div>
                                        <span className={clsx(
                                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                                            refund.status === 'disbursed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                refund.status === 'rejected' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                        )}>{refund.status}</span>
                                    </div>
                                )) : (
                                    <p className="text-xs font-bold text-slate-400 italic py-2">No refund cases found.</p>
                                )}
                                <button onClick={() => navigate(`/dashboard/refunds?taxpayer_id=${id}`)} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-ree-green hover:underline">View All Refunds</button>
                            </div>
                        </InformationCard>
                    </div>
                </div>

                {/* Right Column: Activity & Summary */}
                <div className="space-y-8">
                    <InformationCard title="Compliance Health" icon={CheckCircle2}>
                        <div className="flex flex-col items-center py-6 text-center">
                            <div className="w-24 h-24 rounded-full border-8 border-slate-50 flex items-center justify-center mb-4 relative">
                                <div
                                    className={clsx(
                                        "absolute inset-0 rounded-full border-8 border-t-transparent -rotate-45",
                                        (compliance?.score || 0) >= 70 ? "border-ree-green" :
                                            (compliance?.score || 0) >= 40 ? "border-amber-400" : "border-rose-500"
                                    )}
                                    style={{ clipPath: `conic-gradient(black ${(compliance?.score || 0)}%, transparent 0)` }}
                                />
                                <span className="text-2xl font-black text-slate-900">{compliance?.score || 0}%</span>
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Health Grade</p>
                            <p className={clsx(
                                "text-sm font-bold",
                                (compliance?.score || 0) >= 90 ? "text-emerald-500" :
                                    (compliance?.score || 0) >= 70 ? "text-ree-green" :
                                        (compliance?.score || 0) >= 40 ? "text-amber-500" : "text-rose-500"
                            )}>
                                {(compliance?.score || 0) >= 90 ? 'Perfect Standing' :
                                    (compliance?.score || 0) >= 70 ? 'Excellent Standing' :
                                        (compliance?.score || 0) >= 50 ? 'Fair Standing' : 'Critical Review Needed'}
                            </p>
                        </div>

                        {compliance?.triggered_rules?.length > 0 && (
                            <div className="pt-6 border-t border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Active Issues</p>
                                <div className="space-y-3">
                                    {compliance.triggered_rules.slice(0, 3).map((rule, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-700 leading-tight">{rule.rule_name || rule.rule_code.replace(/_/g, ' ')}</p>
                                                <p className="text-[9px] font-black text-rose-500 mt-1">{rule.score_impact} Points</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-50 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Filings Complete</span>
                                <span className="text-xs font-black text-slate-900">{taxpayer.filing_count} Items</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Active Refunds</span>
                                <span className="text-xs font-black text-slate-900">{taxpayer.active_refund_cases} Cases</span>
                            </div>
                        </div>
                    </InformationCard>

                    {unresolvedAlerts.length > 0 && (
                        <InformationCard title="Compliance Board" icon={AlertTriangle}>
                            <div className="space-y-4">
                                {unresolvedAlerts.map(alert => (
                                    <div key={alert.id} className="p-4 bg-rose-50 rounded-2xl border border-rose-100 border-l-4 border-l-rose-500">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={clsx(
                                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                                                alert.alert_type === 'critical' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                                            )}>
                                                {alert.alert_type}
                                            </span>
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{new Date(alert.detected_date).toLocaleDateString()}</p>
                                        </div>
                                        <p className="text-xs font-black text-slate-900 mb-1">{alert.title}</p>
                                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{alert.description}</p>
                                    </div>
                                ))}
                                <button className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline">Open Dispute Center</button>
                            </div>
                        </InformationCard>
                    )}

                    <InformationCard title="Recent Footprints" icon={Clock}>
                        <div className="space-y-6">
                            {footprints.length > 0 ? (
                                footprints.map((log, i) => {
                                    const display = getActionDisplay(log.action);
                                    const Icon = display.icon;
                                    return (
                                        <div key={log.id || i} className="flex gap-4 group">
                                            <div className={clsx(
                                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                log.action === 'create' ? "bg-emerald-50" :
                                                    log.action === 'update' ? "bg-blue-50" :
                                                        log.action === 'verify' ? "bg-indigo-50" :
                                                            log.action === 'soft_delete' ? "bg-rose-50" : "bg-slate-50",
                                                log.action === 'create' ? "text-emerald-500" :
                                                    log.action === 'update' ? "text-blue-500" :
                                                        log.action === 'verify' ? "text-indigo-500" :
                                                            log.action === 'soft_delete' ? "text-rose-500" : "text-slate-500"
                                            )}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 leading-tight mb-1">{display.label}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className={clsx(
                                                        "text-[10px] font-black uppercase",
                                                        log.action === 'create' ? "text-emerald-600" :
                                                            log.action === 'update' ? "text-blue-600" :
                                                                log.action === 'verify' ? "text-indigo-600" :
                                                                    log.action === 'soft_delete' ? "text-rose-600" : "text-slate-600"
                                                    )}>
                                                        {display.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Activity Yet</p>
                                </div>
                            )}
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => navigate(`/dashboard/logs?entity_id=${id}`)}
                                className="w-full mt-6 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all font-mono"
                            >
                                View Full Audit Trail
                            </button>
                        )}
                    </InformationCard>
                </div>
            </div>

            <SidePanel
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="Edit Taxpayer Identity"
                subtitle={`Updating information for ${taxpayer?.full_name}`}
            >
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                            <input
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green transition-all font-bold text-sm"
                                defaultValue={taxpayer?.full_name}
                                id="edit_full_name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green transition-all font-bold text-sm"
                                defaultValue={taxpayer?.email}
                                id="edit_email"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <input
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green transition-all font-bold text-sm"
                                defaultValue={taxpayer?.phone_number}
                                id="edit_phone"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Identification Number (TIN)</label>
                            <input
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green transition-all font-bold text-sm"
                                defaultValue={taxpayer?.tin}
                                id="edit_tin"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resident Address</label>
                        <textarea
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green transition-all font-bold text-sm min-h-[100px]"
                            defaultValue={taxpayer?.address}
                            id="edit_address"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry</label>
                            <input
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green transition-all font-bold text-sm"
                                defaultValue={taxpayer?.industry}
                                id="edit_industry"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Title</label>
                            <input
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green transition-all font-bold text-sm"
                                defaultValue={taxpayer?.job_title}
                                id="edit_job_title"
                            />
                        </div>
                    </div>

                    <div className="pt-10 flex gap-4 border-t border-slate-100">
                        <button
                            onClick={() => setIsEditOpen(false)}
                            className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Cancel Changes
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    setEditLoading(true);
                                    const updateData = {
                                        full_name: document.getElementById('edit_full_name').value,
                                        email: document.getElementById('edit_email').value,
                                        phone_number: document.getElementById('edit_phone').value,
                                        tin: document.getElementById('edit_tin').value,
                                        address: document.getElementById('edit_address').value,
                                        industry: document.getElementById('edit_industry').value,
                                        job_title: document.getElementById('edit_job_title').value,
                                    };
                                    await taxpayerService.updateTaxpayer(id, updateData);
                                    setIsEditOpen(false);
                                    fetchTaxpayer();
                                } catch (error) {
                                    console.error('Failed to update taxpayer', error);
                                    alert('Failed to update taxpayer');
                                } finally {
                                    setEditLoading(false);
                                }
                            }}
                            disabled={editLoading}
                            className="flex-[2] bg-ree-green text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-ree-light transition-all shadow-xl shadow-ree-green/20 flex items-center justify-center gap-2"
                        >
                            {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Synchronize Updates
                        </button>
                    </div>
                </div>
            </SidePanel>
        </div>
    );
};

export default TaxpayerDetails;
