import React, { useState } from 'react';
import {
    Search,
    Bell,
    HelpCircle,
    User,
    Settings,
    LogOut,
    Command,
    ChevronDown
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';

import { authService } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

const TopNav = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const [currentOrg] = useState('Ree-fond HQ');

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 sticky top-0 z-20">
            {/* Left side: Search & Organization */}
            <div className="flex items-center gap-8 flex-1">
                {/* Org Switcher */}
                <div className="hidden md:flex items-center gap-2 group cursor-pointer bg-slate-100/50 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all">
                    <div className="w-6 h-6 rounded-md bg-ree-green/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-ree-green" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{currentOrg}</span>
                </div>

                {/* Global Search */}
                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-ree-green transition-colors" />
                    <input
                        type="text"
                        placeholder="Search organizations, taxpayers, or filings..."
                        className="w-full pl-11 pr-12 py-2.5 bg-slate-100/50 border-transparent focus:bg-white focus:border-ree-green/20 focus:ring-4 focus:ring-ree-green/5 rounded-2xl text-sm font-medium transition-all outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-black text-slate-400 bg-white pointer-events-none">
                        <Command className="w-3 h-3" /> K
                    </div>
                </div>
            </div>

            {/* Right side: Actions & Profile */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-colors group">
                    <Bell className="w-5 h-5 text-slate-500 group-hover:text-slate-900" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>

                {/* Documentation */}
                <button className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-slate-50 transition-colors group" title="Documentation">
                    <HelpCircle className="w-5 h-5 text-slate-500 group-hover:text-slate-900" />
                </button>

                <div className="w-px h-6 bg-slate-200 mx-2" />

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1 pr-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-ree-green/30 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-ree-green transition-colors font-black">
                            {user.name?.[0] || 'A'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-xs font-black text-slate-900 leading-none mb-1">{user.name || 'Admin'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role || 'Superuser'}</p>
                        </div>
                        <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden"
                            >
                                <div className="p-4 border-b border-slate-50">
                                    <p className="text-sm font-black text-slate-900">{user.name || 'System Administrator'}</p>
                                    <p className="text-xs text-slate-500 font-medium">{user.email || 'admin@reefond.com'}</p>
                                </div>
                                <div className="p-2">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                                        <User className="w-4 h-4" />
                                        Profile Settings
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                                        <Settings className="w-4 h-4" />
                                        Account Preferences
                                    </button>
                                </div>
                                <div className="p-2 border-t border-slate-50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header >
    );
};

export default TopNav;
