import React, { useState, useEffect, useCallback } from 'react';
import {
    Archive, Upload, Search, Filter, Plus, Loader2, AlertCircle,
    FileText, Shield, CheckCircle2, Clock, XCircle, ExternalLink,
    Lock, Users, Fingerprint, EyeOff, ShieldAlert, Key, RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';
import { documentsService } from '../../api/documents';
import { authService } from '../../api/auth';
import apiClient from '../../api/auth';

const DOC_TYPE_COLORS = {
    cac: 'blue',
    tin: 'green',
    vat: 'amber',
    insurance: 'purple',
    financial: 'indigo',
    identity: 'rose',
    other: 'slate',
};

const cyberColorMap = {
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    green: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    indigo: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
    rose: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    slate: 'border-slate-500/30 text-slate-400 bg-slate-500/10',
};

const CyberCard = ({ doc, onVerify, currentUserRole }) => {
    const docColor = DOC_TYPE_COLORS[doc.document_type?.toLowerCase()] || 'slate';
    const c = cyberColorMap[docColor];
    const isExpired = doc.is_expired;
    const daysLeft = doc.days_until_expiry;
    const canVerify = currentUserRole === 'ADMIN' || currentUserRole === 'ORGANIZATION';

    return (
        <div className={clsx(
            'bg-slate-900 border transition-all duration-300 hover:border-ree-green/50 group overflow-hidden relative flex flex-col',
            isExpired ? 'border-rose-500/50' : doc.is_verified ? 'border-emerald-500/30' : 'border-amber-500/30'
        )} style={{ borderRadius: '1.5rem', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }}>

            {/* Decal background */}
            <div className="absolute -bottom-6 -right-6 text-slate-800/30 pointer-events-none transform rotate-12 group-hover:text-ree-green/10 transition-colors">
                <Shield className="w-32 h-32" />
            </div>

            <div className="p-5 flex-1 z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border', c)}>
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        {doc.is_verified ? (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                                <CheckCircle2 className="w-3 h-3" /> Encrypted & Verified
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                                <Clock className="w-3 h-3" /> Awaiting Clearance
                            </div>
                        )}
                        {isExpired && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-rose-400 uppercase">
                                <ShieldAlert className="w-3 h-3" /> Certificate Expired
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="font-bold text-slate-100 text-sm leading-tight mb-1 truncate" title={doc.filename}>
                    {doc.filename}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                    <span className={clsx('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border', c)}>
                        {doc.document_type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                        {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)} KB` : doc.file_type?.toUpperCase()}
                    </span>
                </div>

                {doc.description && (
                    <p className="text-xs text-slate-400 font-medium mt-4 line-clamp-2">{doc.description}</p>
                )}

                {daysLeft !== null && daysLeft !== undefined && !isExpired && (
                    <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center gap-2">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span className={clsx('text-[10px] font-mono', daysLeft < 30 ? 'text-amber-400' : 'text-slate-500')}>
                            EXPIRES_IN:{daysLeft}d
                        </span>
                    </div>
                )}
            </div>

            <div className="px-5 pb-5 flex items-center gap-2 z-10 border-t border-slate-800/50 pt-4 bg-slate-900/50 backdrop-blur-md">
                {doc.file_url && (
                    <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-300 transition-all border border-slate-700 hover:text-white"
                    >
                        <ExternalLink className="w-3 h-3" /> Access
                    </a>
                )}
                {!doc.is_verified && canVerify && (
                    <button
                        onClick={() => onVerify(doc.id, true)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-ree-green/20 hover:bg-ree-green border border-ree-green/50 rounded-lg text-[10px] font-bold uppercase tracking-widest text-ree-green hover:text-black transition-all"
                    >
                        <Fingerprint className="w-3 h-3" /> Authorize
                    </button>
                )}
            </div>
        </div>
    );
};

const UploadModal = ({ orgId, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        document_type: 'other', filename: '', file_url: '', file_type: 'pdf', description: '', expiry_date: '',
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErr('');
        try {
            const payload = { ...form };
            if (!payload.expiry_date) delete payload.expiry_date;
            await documentsService.addOrgDocument(orgId, payload);
            onSuccess();
            onClose();
        } catch (error) {
            setErr(error?.response?.data?.detail || 'Failed to upload document.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 shadow-[0_0_100px_rgba(34,197,94,0.1)] rounded-[2rem] w-full max-w-lg p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ree-green to-transparent opacity-50"></div>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-ree-green" /> Inject File
                        </h2>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">SECURE_UPLOAD_PROTO</span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {[
                        { label: 'FILENAME', key: 'filename', type: 'text', required: true },
                        { label: 'REMOTE_URI', key: 'file_url', type: 'url', required: true, placeholder: 'https://...' },
                        { label: 'FILE_EXT', key: 'file_type', type: 'text', placeholder: 'pdf, docx...' },
                        { label: 'METADATA_DESC', key: 'description', type: 'text' },
                        { label: 'EXPIRY_TIMESTAMP', key: 'expiry_date', type: 'date' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="text-[10px] font-mono text-slate-500 mb-1.5 block">{f.label}</label>
                            <input
                                type={f.type}
                                value={form[f.key]}
                                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                placeholder={f.placeholder}
                                required={f.required}
                                className="w-full px-4 py-3 rounded-xl border border-slate-800 text-sm font-medium text-slate-200 focus:outline-none focus:border-ree-green transition-colors bg-slate-950 placeholder-slate-800"
                            />
                        </div>
                    ))}
                    <div>
                        <label className="text-[10px] font-mono text-slate-500 mb-1.5 block">DOC_CLASSIFICATION</label>
                        <select
                            value={form.document_type}
                            onChange={e => setForm(p => ({ ...p, document_type: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-800 text-sm font-medium text-slate-200 focus:outline-none focus:border-ree-green transition-colors bg-slate-950"
                        >
                            {['cac', 'tin', 'vat', 'insurance', 'financial', 'identity', 'other'].map(t => (
                                <option key={t} value={t}>{t.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    {err && <p className="text-[10px] font-mono text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2 rounded">{err}</p>}
                    <div className="flex gap-3 mt-8 pt-4 border-t border-slate-800">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest">Abort</button>
                        <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-ree-green text-black text-xs font-black hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-60 disabled:shadow-none">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            Execute
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DocumentVault = () => {
    const [documents, setDocuments] = useState([]);
    const [authorizedUsers, setAuthorizedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orgId, setOrgId] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterVerified, setFilterVerified] = useState('');
    const [showUpload, setShowUpload] = useState(false);

    const fetchUser = useCallback(async () => {
        try {
            const user = await authService.getCurrentUser();
            setOrgId(user?.organization?.id || user?.organization_id);
            setCurrentUserRole(user?.role);
        } catch { /* user might be set in localStorage */ }
    }, []);

    const fetchDocuments = useCallback(async (currentOrgId) => {
        if (!currentOrgId) return;
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (filterType) params.document_type = filterType;
            if (filterVerified !== '') params.is_verified = filterVerified === 'true';

            const [docs, orgData] = await Promise.all([
                documentsService.getOrgDocuments(currentOrgId, params),
                apiClient.get(`/organizations/${currentOrgId}`).then(r => r.data).catch(() => null) // Fallback if user doesn't have org view access
            ]);

            setDocuments(docs);
            if (orgData?.users) setAuthorizedUsers(orgData.users);

        } catch (err) {
            console.error('Document fetch error:', err);
            setError(err?.response?.data?.detail || 'Vault access denied. Verify your security clearance.');
        } finally {
            setLoading(false);
        }
    }, [filterType, filterVerified]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (!orgId) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const u = JSON.parse(storedUser);
                    setOrgId(u?.organization?.id || u?.organization_id);
                    if (!currentUserRole) setCurrentUserRole(u?.role);
                } catch { /* ignore */ }
            }
        }
    }, [orgId, currentUserRole]);

    useEffect(() => {
        if (orgId) fetchDocuments(orgId);
    }, [orgId, fetchDocuments]);

    const handleVerify = async (docId, isVerified) => {
        try {
            await documentsService.verifyDocument(docId, isVerified);
            fetchDocuments(orgId);
        } catch (err) {
            console.error('Verify failed:', err);
        }
    };

    const filtered = documents.filter(d => {
        const q = search.toLowerCase();
        return !q || d.filename?.toLowerCase().includes(q) || d.document_type?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q);
    });

    const stats = {
        total: documents.length,
        verified: documents.filter(d => d.is_verified).length,
        pending: documents.filter(d => !d.is_verified).length,
    };

    // Replace the default page wrapper to break out of the standard styling
    return (
        <div className="bg-slate-950 min-h-[calc(100vh-6rem)] -m-6 p-6 md:p-10 font-sans text-slate-300 relative border border-slate-900 rounded-[2rem] overflow-hidden shadow-[inset_0_4px_30px_rgba(0,0,0,0.5)]">

            {/* Background cyber grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #22c55e 1px, transparent 1px), linear-gradient(to bottom, #22c55e 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Shield className="w-8 h-8 text-ree-green" />
                            <h1 className="text-3xl font-black text-white tracking-tight">SECURE_VAULT</h1>
                        </div>
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                            <Lock className="w-3 h-3 text-amber-500" /> End-to-End Encrypted Repository
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => fetchDocuments(orgId)}
                            className="w-12 h-12 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white hover:border-ree-green/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                        >
                            <RefreshCw className={clsx('w-5 h-5', loading && 'animate-spin text-ree-green')} />
                        </button>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="h-12 px-6 bg-ree-green text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                        >
                            <Plus className="w-4 h-4" /> Inject Data
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                    {/* Sidebar / Authorized Personnel */}
                    <div className="xl:col-span-1 space-y-6">

                        {/* Status Module */}
                        <div className="bg-black/40 border border-slate-800 rounded-[1.5rem] p-6 backdrop-blur-sm">
                            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Activity className="w-3 h-3 text-ree-green" /> Vault Status
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                    <span className="text-xs font-mono text-slate-400">ENCRYPTED_FILES</span>
                                    <span className="text-sm font-black text-white">{stats.total}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                    <span className="text-xs font-mono text-emerald-400">VERIFIED_OBJS</span>
                                    <span className="text-sm font-black text-emerald-400">{stats.verified}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-mono text-amber-500">PENDING_CLEARANCE</span>
                                    <span className="text-sm font-black text-amber-500">{stats.pending}</span>
                                </div>
                            </div>
                        </div>

                        {/* IAM Context Box */}
                        <div className="bg-black/40 border border-slate-800 rounded-[1.5rem] p-6 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Users className="w-3 h-3 text-blue-400" /> Authorized IAM
                                </h4>
                                <Key className="w-4 h-4 text-slate-600" />
                            </div>

                            {authorizedUsers.length > 0 ? (
                                <div className="space-y-4">
                                    {authorizedUsers.map(u => (
                                        <div key={u.id} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex flex-shrink-0 items-center justify-center font-bold text-xs text-slate-300">
                                                {u.name?.charAt(0) || u.email?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-white truncate">{u.name || 'Unknown'}</p>
                                                <p className="text-[9px] font-mono text-slate-500 uppercase truncate">{u.role}</p>
                                            </div>
                                            <Shield className={clsx("w-3.5 h-3.5", u.role === 'ADMIN' ? 'text-blue-500' : 'text-slate-600')} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <EyeOff className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                                    <p className="text-[10px] text-slate-500 font-mono">IAM LIST NOT FETCHED</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="xl:col-span-3 space-y-6">

                        {/* Terminal Filter Bar */}
                        <div className="bg-black/40 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-4 backdrop-blur-sm">
                            <div className="flex-1 min-w-48 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search filename or metadata..."
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-ree-green focus:outline-none text-sm font-medium text-slate-200 placeholder-slate-600 transition-all font-mono"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={filterType}
                                    onChange={e => setFilterType(e.target.value)}
                                    className="px-4 py-3 bg-slate-900 rounded-xl border border-slate-800 focus:border-ree-green focus:outline-none text-xs font-mono text-slate-400 transition-all uppercase"
                                >
                                    <option value="">ALL_TYPES</option>
                                    {['cac', 'tin', 'vat', 'insurance', 'financial', 'identity', 'other'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterVerified}
                                    onChange={e => setFilterVerified(e.target.value)}
                                    className="px-4 py-3 bg-slate-900 rounded-xl border border-slate-800 focus:border-ree-green focus:outline-none text-xs font-mono text-slate-400 transition-all uppercase"
                                >
                                    <option value="">ALL_STATUS</option>
                                    <option value="true">VERIFIED</option>
                                    <option value="false">AWAITING</option>
                                </select>
                            </div>
                        </div>

                        {/* Document Grid */}
                        {error ? (
                            <div className="border border-rose-500/20 bg-rose-500/10 rounded-[2rem] p-10 flex flex-col items-center gap-4 text-center">
                                <ShieldAlert className="w-12 h-12 text-rose-500" />
                                <div>
                                    <h3 className="font-bold text-white mb-2">ACCESS_DENIED</h3>
                                    <p className="text-sm font-mono text-rose-400">{error}</p>
                                </div>
                                <button onClick={() => fetchDocuments(orgId)} className="mt-4 px-6 py-2 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                                    [ RETRY_CONNECTION ]
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="border border-slate-800 bg-black/20 rounded-[2rem] p-24 flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="w-16 h-16 border-2 border-slate-800 border-t-ree-green rounded-full animate-spin"></div>
                                    <Lock className="w-6 h-6 text-slate-500 absolute inset-0 m-auto" />
                                </div>
                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">DECRYPTING_VAULT_CONTENTS...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="border border-slate-800 border-dashed rounded-[2rem] p-24 flex flex-col items-center justify-center text-center bg-black/10">
                                <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700 mb-6 border border-slate-800">
                                    <Archive className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-white mb-2 tracking-widest uppercase">VAULT_IS_EMPTY</h3>
                                <p className="text-xs font-mono text-slate-500 mb-6">No encrypted files matched the current parameters.</p>
                                <button onClick={() => setShowUpload(true)} className="px-6 py-3 bg-slate-800 text-white rounded-xl text-xs font-mono hover:bg-slate-700 hover:text-ree-green transition-all border border-slate-700 hover:border-ree-green/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                                    &gt; INITIATE_UPLOAD
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.map(doc => (
                                    <CyberCard key={doc.id} doc={doc} onVerify={handleVerify} currentUserRole={currentUserRole} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showUpload && orgId && (
                <UploadModal
                    orgId={orgId}
                    onClose={() => setShowUpload(false)}
                    onSuccess={() => fetchDocuments(orgId)}
                />
            )}
        </div>
    );
};

// Simple Icon fallback since Activity wasn't in original import
const Activity = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);

export default DocumentVault;
