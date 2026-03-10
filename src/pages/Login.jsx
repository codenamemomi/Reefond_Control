import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ChevronRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { authService } from '../api/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authService.login(email, password);

            const { user } = data;
            // Token is now set via HttpOnly cookie by the backend, 
            // but we also set it here for safety if the backend doesn't handle all cases or for the interceptor
            localStorage.setItem('user', JSON.stringify(user));

            // Success animation then navigate
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] relative overflow-hidden font-sans">
            {/* Dynamic Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ree-green/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-ree-light/5 blur-[150px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo/Brand Section */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl mb-6 relative group"
                    >
                        <ShieldCheck className="w-8 h-8 text-ree-green group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5" />
                    </motion.div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">REE-FOND <span className="text-ree-green italic">CONTROL</span></h1>
                    <p className="text-slate-500 font-medium">Internal Administration & Compliance Portal</p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] border border-white relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-ree-green via-ree-light to-ree-green opacity-50" />

                    <form onSubmit={handleLogin} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-3 text-rose-600 text-sm font-semibold"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-ree-green transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@reefond.com"
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-ree-green focus:ring-4 focus:ring-ree-green/10 outline-none transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Security Phrase</label>
                                <Link to="/forgot-password" title="Recover access" className="text-xs font-bold text-ree-green hover:text-ree-light transition-colors">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-ree-green transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-ree-green focus:ring-4 focus:ring-ree-green/10 outline-none transition-all font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative overflow-hidden bg-ree-green text-white py-5 rounded-2xl font-black text-lg tracking-tight transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-xl shadow-ree-green/20"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <span>Enter Control Center</span>
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.1em]">
                            Unauthorized access is strictly prohibited & monitored.
                        </p>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-12 flex items-center justify-center gap-6 text-slate-400">
                    <a href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-ree-green transition-colors">System Status</a>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <a href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-ree-green transition-colors">Compliance Guide</a>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <a href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-ree-green transition-colors">Privacy</a>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
