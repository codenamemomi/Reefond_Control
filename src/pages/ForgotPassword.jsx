import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../api/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authService.forgotPassword(email);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] relative overflow-hidden font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md relative z-10 text-center"
                >
                    <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-xl border border-white">
                        <div className="w-20 h-20 bg-ree-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-ree-green" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Check your email</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            We've sent a password reset link to <span className="text-slate-900 font-bold">{email}</span>. Please follow the instructions to reset your password.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-ree-green font-black uppercase tracking-widest text-xs hover:gap-3 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] relative overflow-hidden font-sans">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-ree-green/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mb-8 hover:text-ree-green transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </Link>

                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Password Recovery</h1>
                    <p className="text-slate-500 font-medium">Enter your email to reset your security phrase</p>
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative overflow-hidden bg-ree-green text-white py-5 rounded-2xl font-black text-lg tracking-tight transition-all active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-ree-green/20"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Send Reset Link</span>}
                            </div>
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
