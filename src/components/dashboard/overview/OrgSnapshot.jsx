import React from 'react';
import { Building2, ShieldCheck, MapPin, Fingerprint } from 'lucide-react';

const OrgSnapshot = ({ org = null }) => {
    if (!org) return null;
    const displayOrg = org;
    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col h-full relative overflow-hidden">
            {/* Decorative Brand SVG element could go here */}
            <div className="absolute top-0 right-0 p-8 text-ree-green/5">
                <Building2 className="w-32 h-32" />
            </div>

            <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-ree-green flex items-center justify-center text-white shadow-xl shadow-ree-green/20">
                    <Building2 className="w-7 h-7" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{displayOrg.name}</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Active Organization</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 flex-1 relative z-10">
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Fingerprint className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Tax ID (TIN)</span>
                    </div>
                    <p className="font-black text-slate-900">{displayOrg.tin}</p>
                </div>
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">VAT Status</span>
                    </div>
                    <p className="font-black text-emerald-500 italic">{displayOrg.vat}</p>
                </div>
                <div className="col-span-2 space-y-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Jurisdiction</span>
                    </div>
                    <p className="font-black text-slate-900 truncate">{displayOrg.location}</p>
                </div>
            </div>

            <div className="mt-8 flex items-center gap-4 relative z-10">
                <button className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-ree-green hover:text-ree-green transition-all">
                    Internal Docs
                </button>
                <button className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-ree-green hover:text-ree-green transition-all">
                    API Access
                </button>
            </div>
        </div>
    );
};

export default OrgSnapshot;
