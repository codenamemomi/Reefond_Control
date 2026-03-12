import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft, Loader2, Zap, Shield, Building2, Briefcase } from 'lucide-react';
import { billingService } from '../api/billing';
import { clsx } from 'clsx';

const PRICING_PLANS = [
    {
        id: 'starter',
        name: 'Starter Plan',
        description: 'Designed for startups and developers exploring the Ree-fond ecosystem.',
        price: '₦0',
        centPrice: 0,
        icon: Briefcase,
        features: [
            '1 organization & 2 users',
            'Up to 50 taxpayers',
            '50 filings per month',
            '1 active refund case',
            'Basic compliance scoring',
            'API sandbox access'
        ],
        notIncluded: []
    },
    {
        id: 'compliance_starter',
        name: 'Compliance Starter',
        description: 'Ideal for small businesses, payroll startups, and accounting firms.',
        price: '₦30,000',
        centPrice: 3000000,
        icon: Shield,
        features: [
            '1 organization & up to 5 users',
            '1,000 taxpayer records',
            'Unlimited filings',
            'Refund case tracking',
            'Compliance scoring',
            'Document storage',
            'Full audit trail',
            'Limited API access'
        ],
        notIncluded: []
    },
    {
        id: 'compliance_pro',
        name: 'Compliance Pro',
        description: 'Built for HR platforms, payroll systems, and mid-size companies.',
        price: '₦150,000',
        centPrice: 15000000,
        isPopular: true,
        icon: Zap,
        features: [
            'Up to 3 organizations & 20 users',
            '10,000 taxpayer records',
            'Unlimited filings & refund cases',
            'Compliance analytics dashboard',
            'Automated compliance alerts',
            'Advanced document vault',
            'API integrations'
        ],
        notIncluded: []
    },
    {
        id: 'platform',
        name: 'Platform Plan',
        description: 'Designed for fintechs embedding Ree-fond infrastructure.',
        price: '₦700,000',
        centPrice: 70000000,
        icon: Building2,
        features: [
            'Unlimited orgs & users',
            'Unlimited taxpayer records',
            'Full API & Webhook access',
            'White-label compliance modules',
            'Advanced compliance engine',
            'Priority support'
        ],
        notIncluded: []
    },
    {
        id: 'enterprise',
        name: 'Enterprise Plan',
        description: 'For large enterprises and government institutions.',
        price: 'Custom',
        centPrice: 500000000,
        icon: Shield,
        features: [
            'Dedicated infrastructure',
            'Custom integrations',
            'State & regulatory dashboards',
            'Compliance intelligence',
            'Regulatory analytics',
            'SLA uptime guarantees',
            'Dedicated account management'
        ],
        notIncluded: []
    }
];

const Pricing = () => {
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [error, setError] = useState('');

    const handleSelectPlan = async (planId, price) => {
        if (price === 0) {
            // Free plan doesn't need checkout
            navigate('/dashboard/billing');
            return;
        }

        try {
            setLoadingPlan(planId);
            setError('');
            const data = await billingService.createCheckoutSession(planId);

            if (data.checkout_url) {
                window.location.assign(data.checkout_url);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to initialize checkout session.');
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-ree-green/20">
            {/* Nav Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Application
                </button>
                <div className="text-xl font-black text-slate-900 tracking-tighter">REE-FOND <span className="text-ree-green">PRO</span></div>
            </div>

            <div className="w-full max-w-[1800px] mx-auto px-6 lg:px-12 py-20 lg:py-32">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight mb-6">
                        Scale your operations, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-ree-green to-emerald-400">securely over cloud.</span>
                    </h1>
                    <p className="text-lg font-medium text-slate-500">
                        Choose the orchestration tier that best suits your organizational compliance architecture. Update or downgrade seamlessly any time.
                    </p>

                    {error && (
                        <div className="mt-8 bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl flex items-center gap-3 justify-center">
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-bold text-sm tracking-tight">{error}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 xl:gap-8 items-stretch pb-16">
                    {PRICING_PLANS.map((plan) => {
                        const Icon = plan.icon;
                        const isPopular = plan.isPopular;

                        return (
                            <div
                                key={plan.id}
                                className={clsx(
                                    "rounded-[2.5rem] p-8 flex flex-col relative transition-all duration-300 min-h-[750px]",
                                    isPopular
                                        ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20 scale-105 z-10 border-0"
                                        : "bg-white text-slate-900 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-ree-green/30"
                                )}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-[40%]">
                                        <div className="bg-gradient-to-r from-emerald-400 to-ree-green text-white text-[10px] font-black uppercase tracking-widest py-2 px-6 rounded-full shadow-lg">
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <div className="mb-8 mt-4">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-[1rem] flex items-center justify-center mb-6",
                                        isPopular ? "bg-white/10 text-ree-light" : "bg-slate-50 text-slate-900"
                                    )}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className={clsx("text-2xl font-black tracking-tight mb-2", isPopular ? "text-white" : "text-slate-900")}>
                                        {plan.name}
                                    </h3>
                                    <p className={clsx("text-sm font-medium mb-6 h-12 leading-relaxed", isPopular ? "text-slate-400" : "text-slate-500")}>
                                        {plan.description}
                                    </p>
                                    <div className="flex items-end gap-1 mb-2 mt-4">
                                        <span className={clsx("text-4xl xl:text-5xl font-black tracking-tighter leading-none", isPopular ? "text-white" : "text-slate-900")}>
                                            {plan.price}
                                        </span>
                                        <span className={clsx("text-sm font-bold mb-1", isPopular ? "text-slate-500" : "text-slate-400")}>
                                            /month
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-5 mt-6 mb-12">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <CheckCircle2 className={clsx("w-5 h-5 flex-shrink-0 mt-0.5", isPopular ? "text-ree-green" : "text-emerald-500")} />
                                            <span className={clsx("text-sm font-medium leading-relaxed", isPopular ? "text-slate-300" : "text-slate-600")}>
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    <button
                                        onClick={() => handleSelectPlan(plan.id, plan.centPrice)}
                                        disabled={loadingPlan !== null}
                                        className={clsx(
                                            "w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2",
                                            isPopular
                                                ? "bg-ree-green text-white hover:bg-emerald-400 shadow-xl shadow-ree-green/20"
                                                : "bg-slate-100 text-slate-900 hover:bg-slate-200",
                                            loadingPlan === plan.id && "bg-slate-800 text-white opacity-90 cursor-not-allowed"
                                        )}
                                    >
                                        {loadingPlan === plan.id ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Provisioning</>
                                        ) : (
                                            plan.centPrice === 0 ? 'Current Plan' : 'Select Plan'
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
