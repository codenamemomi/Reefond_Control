import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    BadgeCheck,
    TrendingUp,
    FileCode,
    Key,
    Webhook,
    Terminal,
    CreditCard,
    Settings as SettingsIcon,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { usePermissions } from '../../hooks/usePermissions';
import { UserPermission } from '../../api/permissions';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { can } = usePermissions();

    const navigation = [
        {
            title: 'DASHBOARD', items: [
                { name: 'Overview', icon: LayoutDashboard, path: '/dashboard', permission: UserPermission.VIEW_DASHBOARD },
            ]
        },
        {
            title: 'CORE OPERATIONS', items: [
                { name: 'Taxpayers', icon: Users, path: '/dashboard/taxpayers', permission: UserPermission.VIEW_TAXPAYERS },
                { name: 'Filings', icon: FileText, path: '/dashboard/filings', permission: UserPermission.VIEW_FILINGS },
                { name: 'Refund Cases', icon: TrendingUp, path: '/dashboard/refunds', permission: UserPermission.VIEW_REFUND_CASES },
                { name: 'Compliance', icon: BadgeCheck, path: '/dashboard/compliance', permission: UserPermission.VIEW_DASHBOARD },
            ]
        },
        {
            title: 'RESOURCES', items: [
                { name: 'Reports', icon: FileText, path: '/dashboard/reports', permission: UserPermission.VIEW_REPORTS },
                { name: 'Document Vault', icon: Archive, path: '/dashboard/vault', permission: UserPermission.VIEW_FILINGS },
                { name: 'Analytics', icon: TrendingUp, path: '/dashboard/analytics', permission: UserPermission.VIEW_DASHBOARD },
            ]
        },
        {
            title: 'DEVELOPERS', items: [
                { name: 'API Keys', icon: Key, path: '/dashboard/api-keys', permission: UserPermission.MANAGE_API_KEYS },
                { name: 'Webhooks', icon: Webhook, path: '/dashboard/webhooks', permission: UserPermission.CONFIGURE_WEBHOOKS },
                { name: 'Sandbox', icon: Terminal, path: '/dashboard/sandbox', permission: UserPermission.USE_SANDBOX },
                { name: 'Logs', icon: FileCode, path: '/dashboard/logs', permission: UserPermission.VIEW_API_LOGS },
            ]
        },
        {
            title: 'BUSINESS', items: [
                { name: 'Billing', icon: CreditCard, path: '/dashboard/billing', permission: UserPermission.UPGRADE_PLAN },
                { name: 'Usage', icon: TrendingUp, path: '/dashboard/usage', permission: UserPermission.UPGRADE_PLAN },
            ]
        },
        {
            title: 'SYSTEM', items: [
                { name: 'Settings', icon: SettingsIcon, path: '/dashboard/settings', permission: UserPermission.MANAGE_ORG_SETTINGS },
            ]
        }
    ];

    // Filter navigation groups and items
    const filteredNavigation = navigation
        .map(group => ({
            ...group,
            items: group.items.filter(item => !item.permission || can(item.permission))
        }))
        .filter(group => group.items.length > 0);

    return (
        <motion.aside
            animate={{ width: isOpen ? 280 : 88 }}
            className="bg-white border-r border-slate-200 flex flex-col h-screen relative z-30 transition-shadow duration-300"
        >
            {/* Sidebar Header */}
            <div className="h-20 flex items-center px-6 border-b border-slate-50 overflow-hidden shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ree-green flex items-center justify-center shrink-0 shadow-lg shadow-ree-green/20">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-black text-lg tracking-tight whitespace-nowrap"
                            >
                                REE-FOND <span className="text-ree-green italic">CONTROL</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                {filteredNavigation.map((group, idx) => (
                    <div key={idx} className="mb-6 last:mb-0">
                        <AnimatePresence>
                            {isOpen && (
                                <motion.h3
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-[10px] font-black tracking-[0.2em] text-slate-400 mb-3 ml-2 uppercase"
                                >
                                    {group.title}
                                </motion.h3>
                            )}
                        </AnimatePresence>
                        <div className="space-y-1">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) => clsx(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-ree-green/5 text-ree-green"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon className={clsx(
                                                "w-5 h-5 shrink-0 transition-colors",
                                                isActive ? "text-ree-green" : "group-hover:text-slate-900"
                                            )} />
                                            {isOpen && (
                                                <span className="font-semibold text-sm tracking-tight">{item.name}</span>
                                            )}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-indicator"
                                                    className="absolute left-0 w-1 h-6 bg-ree-green rounded-r-full"
                                                />
                                            )}
                                            {!isOpen && (
                                                <div className="absolute left-full ml-6 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                                    {item.name}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar Footer / Toggle */}
            <div className="p-4 border-t border-slate-50 shrink-0">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors"
                >
                    {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
