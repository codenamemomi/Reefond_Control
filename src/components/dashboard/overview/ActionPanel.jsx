import React from 'react';
import { AlertCircle, ArrowUpRight, FileUp, ShieldAlert } from 'lucide-react';

const ActionPanel = ({ alerts = [] }) => {
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const canManageCompliance = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';

    const actions = alerts.length > 0 ? alerts.map(a => ({
        id: a.id,
        title: a.title || a.description,
        org: a.taxpayer_name || 'System',
        urgency: a.alert_type === 'critical' ? 'high' : 'medium',
        icon: a.alert_type === 'critical' ? ShieldAlert : AlertCircle,
        action: 'Resolve Issue'
    })) : [];

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-6 bg-slate-900 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Action Required</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Urgent Tasks & Deadlines</p>
                </div>
                <div className="px-3 py-1 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                    {alerts.length} Pending
                </div>
            </div>

            <div className="p-4 space-y-3 max-h-[320px] overflow-y-auto scrollbar-hide">
                {actions.map((item) => (
                    <div
                        key={item.id}
                        className="group p-5 rounded-[2rem] bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all border border-transparent hover:border-slate-100"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-rose-500 shrink-0">
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 group-hover:text-ree-green transition-colors">{item.title}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{item.org}</p>
                            </div>
                        </div>

                        {canManageCompliance ? (
                            <button className="w-full py-3 bg-white group-hover:bg-slate-900 group-hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-slate-100 group-hover:border-slate-900 flex items-center justify-center gap-2">
                                {item.action}
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <div className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 flex items-center justify-center gap-2 opacity-60 grayscale blur-[0.5px] cursor-not-allowed">
                                View Restricted
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-6 border-t border-slate-50 bg-slate-50/10">
                <button className="w-full py-2 text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
                    Dismiss All Notifications
                </button>
            </div>
        </div>
    );
};

export default ActionPanel;
