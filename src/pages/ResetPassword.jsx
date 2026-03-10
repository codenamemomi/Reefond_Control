import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../api/auth';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authService.resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-white text-center"
                >
                    <div className="w-20 h-20 bg-ree-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-ree-green" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Password Reset!</h2>
                    <p className="text-slate-500 font-medium mb-8">
                        Your security phrase has been successfully updated. Redirecting you to login...
                    </p>
                    <Link to="/login" className="text-ree-green font-black uppercase tracking-widest text-xs">Login Now</Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] relative overflow-hidden font-sans">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ree-green/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Create New Phrase</h1>
                    <p className="text-slate-500 font-medium">Reset your secure access to REE-FOND Control</p>
                </div>

                <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-xl border border-white">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-3 text-rose-600 text-sm font-semibold"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">New Security Phrase</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-ree-green transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-ree-green focus:ring-4 focus:ring-ree-green/10 outline-none transition-all font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ree-green transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Confirm Phrase</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-ree-green transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-ree-green focus:ring-4 focus:ring-ree-green/10 outline-none transition-all font-medium"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="w-full group relative overflow-hidden bg-ree-green text-white py-5 rounded-2xl font-black text-lg tracking-tight transition-all active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-ree-green/20"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Reset Security Phrase</span>}
                            </div>
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
