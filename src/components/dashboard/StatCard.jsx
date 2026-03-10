import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'ree-green' }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Icon className="w-24 h-24" />
            </div>

            <div className="flex items-start justify-between mb-4">
                <div className={clsx("p-3 rounded-2xl", color === 'ree-green' ? 'bg-ree-green/10' : `bg-${color}/10`)}>
                    <Icon className={clsx("w-6 h-6", color === 'ree-green' ? 'text-ree-green' : `text-${color}`)} />
                </div>
                {trend && (
                    <div className={clsx(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-tight",
                        trend === 'up' ? "bg-emerald-50 text-emerald-600" :
                            trend === 'down' ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"
                    )}>
                        {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                            trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {trendValue}
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.15em] mb-1">{title}</h3>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
        </motion.div>
    );
};

export default StatCard;
