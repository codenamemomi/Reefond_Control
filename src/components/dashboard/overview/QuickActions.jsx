import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, FileBarChart, PieChart } from 'lucide-react';

const QuickActions = () => {
    const navigate = useNavigate();
    const actions = [
        { label: 'Create Filing', icon: Plus, color: 'bg-ree-green', path: '/dashboard/filings', state: { openNew: true } },
        { label: 'Submit Refund', icon: FileBarChart, color: 'bg-blue-500', path: '/dashboard/refunds', state: { openNew: true } },
        { label: 'Compliance Report', icon: PieChart, color: 'bg-indigo-500', path: '/dashboard/compliance' },
        { label: 'Upload Documents', icon: Upload, color: 'bg-amber-500', path: '/dashboard/vault' },
    ];

    return (
        <div className="flex flex-wrap gap-3">
            {actions.map((action, i) => (
                <button
                    key={i}
                    onClick={() => navigate(action.path, { state: action.state })}
                    className="group flex items-center gap-3 bg-white hover:bg-slate-900 border border-slate-200 hover:border-slate-900 px-6 py-3 rounded-2xl transition-all hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-0.5"
                >
                    <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center text-white shrink-0 shadow-lg shadow-${action.color}/20 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-slate-700 group-hover:text-white uppercase tracking-widest">{action.label}</span>
                </button>
            ))}
        </div>
    );
};

export default QuickActions;
