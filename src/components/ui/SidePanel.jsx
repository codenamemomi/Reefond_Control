import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

const SidePanel = ({ isOpen, onClose, title, children, size = "md" }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const sizes = {
        sm: "max-w-md",
        md: "max-w-xl",
        lg: "max-w-3xl",
        xl: "max-w-5xl"
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={clsx(
                            "relative w-full bg-white shadow-2xl flex flex-col h-full",
                            sizes[size]
                        )}
                    >
                        <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Direct Enrollment Engine</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors border border-slate-50 shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SidePanel;
