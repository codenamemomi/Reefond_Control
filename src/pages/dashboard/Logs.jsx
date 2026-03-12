import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Terminal, Lock, ShieldAlert, Activity,
    Search, Filter, ExternalLink, ShieldCheck, Download, Loader2, AlertTriangle
} from 'lucide-react';
import { logsService } from '../../api/logs';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const Logs = () => {
    const [searchParams] = useSearchParams();
    const entityId = searchParams.get('entity_id');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);

    // Auth context checks
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const params = { limit: 100 };
            if (entityId) params.entity_id = entityId;

            const data = await logsService.getAuditLogs(params);
            setLogs(data);
        } catch (err) {
            console.error('Error fetching logs', err);
            if (err.response?.status === 403 || err.response?.status === 401) {
                setUnauthorized(true);
            }
        } finally {
            setLoading(false);
        }
    }, [entityId]);

    useEffect(() => {
        if (user.role !== 'ADMIN') {
            setUnauthorized(true);
            setLoading(false);
            return;
        }

        fetchLogs();
    }, [user.role, fetchLogs]);

    const getActionColor = (action) => {
        const a = action.toLowerCase();
        if (a.includes('delete') || a.includes('remove') || a.includes('fail')) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
        if (a.includes('update') || a.includes('edit') || a.includes('modify')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        if (a.includes('create') || a.includes('add') || a.includes('login')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20'; // Default read/view
    };

    if (loading) {
        return (
            <div className="p-32 flex flex-col items-center gap-6">
                <Loader2 className="w-16 h-16 text-ree-green animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Establishing Secure Connection...</p>
            </div>
        );
    }

    return (
        <div className="relative space-y-10 pb-16 min-h-[80vh]">

            {/* Header */}
            <div className={clsx("flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300", unauthorized && "blur-md pointer-events-none opacity-50 select-none")}>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
                        System Logs <Terminal className="w-8 h-8 text-slate-400" />
                    </h1>
                    <p className="text-slate-500 font-medium">Immutable audit trail of all infrastructure activity.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95">
                        <Download className="w-4 h-4" />
                        Export Syslog
                    </button>
                </div>
            </div>

            {/* Unauthorized Overlay */}
            <AnimatePresence>
                {unauthorized && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-xl z-0 rounded-[3rem]" />

                        <div className="bg-slate-900 rounded-[2.5rem] p-10 max-w-lg w-full z-10 text-center shadow-2xl shadow-rose-900/20 border border-slate-800 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                            <ShieldAlert className="absolute -top-10 -right-10 w-40 h-40 text-rose-500/10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-6">
                                    <Lock className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight mb-2">Access Denied</h2>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-6">Insufficient Clearance Level</h3>

                                <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">
                                    The system logs contain sensitive cryptographic and infrastructure data. Your current identity matrix <strong className="text-white">({user.role || 'UNKNOWN'})</strong> lacks the required <strong className="text-ree-green">ADMIN</strong> verification to access this endpoint.
                                </p>

                                <div className="w-full h-px bg-slate-800 mb-6" />

                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/50 px-4 py-2 rounded-full">
                                    <Activity className="w-3 h-3 text-emerald-500" />
                                    Security protocol activated. Activity logged.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Log Viewer (Blurred if unauthorized) */}
            <div className={clsx("bg-[#0f172a] rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col border border-slate-800 transition-all duration-300", unauthorized && "blur-xl pointer-events-none opacity-30 select-none")}>

                {/* Search/Filter Bar */}
                <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter by hash, entity, or actor..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-ree-green/50 focus:ring-1 focus:ring-ree-green/50 rounded-xl text-sm font-medium transition-all outline-none text-white placeholder:text-slate-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-bold hover:bg-slate-800 transition-colors">
                            <Filter className="w-4 h-4" /> Filters
                        </button>
                    </div>
                </div>

                {/* Log Table Container */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-900 border-b border-slate-800">
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Timestamp (UTC)</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Operation / Action</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Actor ID</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Target Entity</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-mono text-xs">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors group cursor-crosshair">
                                    <td className="px-6 py-4 text-slate-400">
                                        {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={clsx("inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-bold tracking-widest uppercase", getActionColor(log.action))}>
                                            {log.action}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 truncate max-w-[150px]" title={log.user_id}>
                                        {log.user_id.substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase text-slate-500">{log.entity_type}</span>
                                            {log.entity_id.substring(0, 8)}...
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-slate-500 group-hover:text-ree-green transition-colors flex items-center gap-1 cursor-pointer">
                                            <ExternalLink className="w-3.5 h-3.5" /> Inspect Matrix
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {/* Empty state purely for visual density if logs array is empty but authorized */}
                            {!unauthorized && logs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <AlertTriangle className="w-6 h-6 mx-auto mb-3 opacity-50" />
                                        <p className="font-mono text-xs uppercase tracking-widest">No audit signals intercepted</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Logs;
