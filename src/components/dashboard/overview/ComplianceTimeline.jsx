import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

const ComplianceTimeline = ({ timeline = [] }) => {
    const events = timeline.length > 0 ? timeline.slice(0, 3).map(e => ({
        date: new Date(e.due_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        title: `${e.taxpayer_name} • ${e.tax_type}`,
        type: e.is_late || new Date(e.due_date) < new Date() ? 'deadline' : 'upcoming'
    })) : [];

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Compliance Timeline</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Upcoming Deadlines</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-slate-400" />
                </div>
            </div>

            <div className="space-y-4 flex-1">
                {events.map((event, i) => (
                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                        <div className="flex flex-col items-center shrink-0 w-12 py-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-ree-green/10 group-hover:border-ree-green/20 transition-all">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.date.split(' ')[0]}</span>
                            <span className="text-sm font-black text-slate-900">{event.date.split(' ')[1]}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800 group-hover:text-ree-green transition-colors">{event.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${event.type === 'deadline' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                    {event.type === 'deadline' ? 'Hard Deadline' : 'Scheduled'}
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-ree-green transition-all" />
                    </div>
                ))}
            </div>

            <button className="mt-8 py-3 w-full border-2 border-slate-50 rounded-2xl text-xs font-black text-slate-500 hover:bg-slate-50 uppercase tracking-widest transition-all">
                Sync with Google Calendar
            </button>
        </div>
    );
};

export default ComplianceTimeline;
