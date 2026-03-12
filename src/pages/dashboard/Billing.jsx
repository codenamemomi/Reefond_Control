import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    CreditCard, Receipt, TrendingUp, History,
    Download, AlertCircle, Loader2, DollarSign,
    CheckCircle2, Building, ShieldCheck, Zap
} from 'lucide-react';
import { billingService } from '../../api/billing';
import { clsx } from 'clsx';

const Billing = () => {
    const [billing, setBilling] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const loadBilling = useCallback(async () => {
        if (!user.organization_id) {
            setError("No organization linked to this account.");
            setLoading(false);
            return;
        }

        try {
            const data = await billingService.getOrganizationBilling(user.organization_id);
            setBilling(data);
        } catch (err) {
            console.error('Failed to load billing', err);
            setError(err.response?.data?.detail || "Failed to establish secure financial connection.");
        } finally {
            setLoading(false);
        }
    }, [user.organization_id]);

    useEffect(() => {
        loadBilling();

        const verifySession = async (sessionId) => {
            try {
                const data = await billingService.verifyCheckoutSession(sessionId);
                if (data.status === 'success') {
                    setSuccessMsg('Payment successfully processed! Your subscription tier has been upgraded.');
                    loadBilling(); // Reload the UI to fetch latest tier
                } else if (data.status === 'pending') {
                    setSuccessMsg('Payment is currently pending verification. Your account will update shortly.');
                }
            } catch (err) {
                console.error("Verification error", err);
                setError('Could not verify your checkout session. If you paid, please contact support.');
            }
        };

        // Handle checkout redirects
        const status = searchParams.get('status');
        const sessionId = searchParams.get('session_id');

        if (status === 'success' && sessionId) {
            // Actively verify it through backend since local users lack webhooks
            verifySession(sessionId);

            // Clear URL gracefully
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (status === 'success') {
            setSuccessMsg('Payment successfully processed!');
        } else if (status === 'cancelled') {
            setError('Checkout was cancelled. Your account remains on the existing cycle restrictions.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [searchParams, loadBilling]);



    if (loading) {
        return (
            <div className="p-32 flex flex-col items-center gap-6">
                <Loader2 className="w-16 h-16 text-ree-green animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Decrypting Financial Ledger...</p>
            </div>
        );
    }

    if (error && !billing) {
        return (
            <div className="p-32 flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{error}</h3>
                <button onClick={loadBilling} className="text-ree-green font-bold hover:underline">Retry Connection</button>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-16">
            {/* Notifications */}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-6 py-4 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="font-bold text-sm tracking-tight">{successMsg}</p>
                </div>
            )}
            {error && billing && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-bold text-sm tracking-tight">{error}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Billing & Integration</h1>
                    <p className="text-slate-500 font-medium">Manage corporate subscriptions, invoices, and ledger states.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/pricing')}
                        className="bg-ree-green text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-ree-light transition-all flex items-center gap-2 shadow-xl shadow-ree-green/20 active:scale-95"
                    >
                        <Zap className="w-4 h-4" />
                        Upgrade / Change Plan
                    </button>
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95">
                        <CreditCard className="w-4 h-4" />
                        Update Method
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Plan Card */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-ree-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-ree-green/20 transition-all duration-1000" />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className={clsx(
                                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    billing?.current_plan === 'starter'
                                        ? "bg-slate-800 text-slate-400 border-slate-700"
                                        : "bg-ree-green/20 text-ree-green border-ree-green/30"
                                )}>
                                    <ShieldCheck className="w-3 h-3" /> {billing?.current_plan?.replace('_', ' ').toUpperCase() || 'STARTER'} TIER
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Active</span>
                                </div>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">₦{Number(billing?.outstanding_balance || 0).toLocaleString()}</h2>
                            <p className="text-slate-400 font-medium text-sm mt-1">Outstanding Balance</p>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-medium">Available Credit</span>
                                <span className="font-bold text-white">₦{Number(billing?.credit_balance || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-medium">Next Billing Cycle</span>
                                <span className="font-bold text-white">{billing?.next_billing_date ? new Date(billing.next_billing_date).toLocaleDateString() : 'Active'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-medium">Cycle Status</span>
                                <span className="font-black text-emerald-400 text-xs uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">{billing?.subscription_period || 'MONTHLY'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ledger & Transactions */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Invoices</h3>
                            </div>
                            <button className="text-[10px] font-black text-ree-green uppercase tracking-[0.2em] hover:text-ree-light transition-colors flex items-center gap-1">
                                <Download className="w-3 h-3" /> Download All
                            </button>
                        </div>

                        <div className="p-4 flex-1">
                            {(!billing?.recent_transactions || billing.recent_transactions.length === 0) ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                                    <Receipt className="w-10 h-10 text-slate-300 mb-3" />
                                    <p className="text-sm font-bold text-slate-500">No ledgers generated</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Transaction matrix is empty</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {billing.recent_transactions.map((tx, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                    tx.status === 'paid' ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"
                                                )}>
                                                    {tx.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{tx.description || `${tx.plan_tier?.replace('_', ' ').toUpperCase()} Plan Upgrade`}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'Recent'} • {tx.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-slate-900">₦{Number(tx.amount || 0).toLocaleString()}</span>
                                                <button className="text-slate-300 group-hover:text-ree-green transition-colors p-2">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;
