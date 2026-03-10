import React from 'react';
import { clsx } from 'clsx';

const Input = ({ label, error, className, ...props }) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <input
                className={clsx(
                    "w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition-all font-medium text-sm",
                    "focus:bg-white focus:border-ree-green/30 focus:ring-4 focus:ring-ree-green/5",
                    error ? "border-rose-300 focus:border-rose-300 focus:ring-rose-50" : "border-slate-200",
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">{error}</p>
            )}
        </div>
    );
};

export default Input;
