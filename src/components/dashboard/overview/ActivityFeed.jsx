import React from 'react';
import { CheckCircle2, FileUp, AlertTriangle, PlayCircle } from 'lucide-react';
import { clsx } from 'clsx';

const ActivityFeed = ({ activities = [] }) => {
    const displayActivities = activities.length > 0 ? activities.map(a => ({
        id: a.id,
        type: a.activity_type?.toLowerCase().includes('error') || a.activity_type?.toLowerCase().includes('fail') ? 'warning' : 'success',
        text: a.description,
        time: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        icon: a.activity_type?.toLowerCase().includes('filing') ? CheckCircle2 :
            a.activity_type?.toLowerCase().includes('document') ? FileUp :
                a.activity_type?.toLowerCase().includes('refund') ? AlertTriangle : PlayCircle
    })) : [];

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Compliance Activity</h3>
                <button className="text-xs font-bold text-ree-green hover:underline uppercase tracking-widest">See All</button>
            </div>

            <div className="relative space-y-8 flex-1">
                {/* Connection Line */}
                <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-slate-100" />

                {displayActivities.map((item) => (
                    <div key={item.id} className="relative flex items-start gap-4 group">
                        <div className={clsx(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all border-4 border-white shadow-sm",
                            item.type === 'success' ? "bg-emerald-50 text-emerald-500" :
                                item.type === 'warning' ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
                        )}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <div className="pt-1">
                            <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-ree-green transition-colors">{item.text}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">{item.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;
