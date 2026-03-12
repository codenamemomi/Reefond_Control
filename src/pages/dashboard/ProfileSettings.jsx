import React, { useState, useEffect } from 'react';
import {
    User, Mail, Lock, Shield,
    Save, Loader2, Key, Activity,
    CheckCircle2, AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { authService } from '../../api/auth';

const ProfileSettings = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [msgVisible, setMsgVisible] = useState(false);

    const [profile, setProfile] = useState({
        name: '',
        email: ''
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [userMeta, setUserMeta] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setFetching(true);
        try {
            const data = await authService.getCurrentUser();
            setProfile({
                name: data.name || '',
                email: data.email || ''
            });
            setUserMeta(data);

            // Also update local storage so TopNav updates
            localStorage.setItem('user', JSON.stringify(data));
        } catch (err) {
            console.error('Failed to load profile', err);
            showTempMessage('Failed to load profile data. Please refresh.', 'error');
        } finally {
            setFetching(false);
        }
    };

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const showTempMessage = (msg, type = 'success') => {
        if (type === 'success') {
            setSuccess(msg);
            setError('');
        } else {
            setError(msg);
            setSuccess('');
        }
        setMsgVisible(true);
        setTimeout(() => setMsgVisible(false), 5000);
    };

    const submitProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await authService.updateProfile({
                name: profile.name,
                // Some backends might not allow changing email easily or require verification, 
                // but we'll send it based on available endpoint.
                email: profile.email
            });
            setUserMeta(result);
            localStorage.setItem('user', JSON.stringify(result));
            showTempMessage('Profile updated successfully.', 'success');
        } catch (err) {
            console.error(err);
            showTempMessage(err.response?.data?.detail || 'Failed to update profile.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const submitPassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            showTempMessage('New passwords do not match.', 'error');
            return;
        }
        setLoading(true);
        try {
            await authService.changePassword(passwords.currentPassword, passwords.newPassword);
            showTempMessage('Security credentials updated successfully.', 'success');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error(err);
            showTempMessage(err.response?.data?.detail || 'Failed to change password.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="p-32 flex flex-col items-center gap-6">
                <Loader2 className="w-16 h-16 text-ree-green animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Loading Identity Matrix...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-16">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Profile</h1>
                <p className="text-slate-500 font-medium">Manage your personal information and security credentials.</p>
            </div>

            {/* Notification Area */}
            {msgVisible && (
                <div className={clsx(
                    "p-4 rounded-2xl flex items-center gap-3 transition-opacity duration-300",
                    success ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                    {success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="font-bold text-sm">{success || error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Identity Info */}
                <div className="lg:col-span-1 space-y-8">
                    {/* User Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-center relative overflow-hidden group border border-slate-800">
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-800/20 to-transparent pointer-events-none" />
                        <Activity className="absolute -top-10 -right-10 w-40 h-40 text-white/5 group-hover:scale-110 transition-transform duration-1000" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border-4 border-slate-800 shadow-xl flex items-center justify-center mb-6">
                                <span className="text-4xl font-black text-white">{profile.name?.[0]?.toUpperCase() || 'U'}</span>
                            </div>
                            <h2 className="text-xl font-black text-white">{profile.name}</h2>
                            <p className="text-slate-400 font-medium text-sm mt-1 mb-4">{profile.email}</p>

                            <div className="w-full h-px bg-slate-800 my-4" />

                            <div className="flex justify-between w-full text-left">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</p>
                                    <div className="flex items-center gap-1.5 mt-1 text-ree-light font-bold text-sm">
                                        <Shield className="w-4 h-4" /> {userMeta?.role || 'Unknown'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                                    <p className="mt-1 text-emerald-400 font-bold text-sm">
                                        {userMeta?.is_active ? 'Active' : 'Suspended'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Forms */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Basic Info Form */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Personal Information</h3>
                                <p className="text-sm text-slate-500">Update your account identity details.</p>
                            </div>
                        </div>

                        <form onSubmit={submitProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest pl-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleProfileChange}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-ree-green/20 focus:ring-4 focus:ring-ree-green/5 rounded-2xl text-sm font-medium transition-all outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest pl-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={handleProfileChange}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-ree-green/20 focus:ring-4 focus:ring-ree-green/5 rounded-2xl text-sm font-medium transition-all outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security Form */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                                <Key className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Security Credentials</h3>
                                <p className="text-sm text-slate-500">Ensure your account remains secure with a strong password.</p>
                            </div>
                        </div>

                        <form onSubmit={submitPassword} className="space-y-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest pl-1">Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwords.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-ree-green/20 focus:ring-4 focus:ring-ree-green/5 rounded-2xl text-sm font-medium transition-all outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-900 uppercase tracking-widest pl-1">New Password</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwords.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-ree-green/20 focus:ring-4 focus:ring-ree-green/5 rounded-2xl text-sm font-medium transition-all outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-900 uppercase tracking-widest pl-1">Confirm New Password</label>
                                        <div className="relative">
                                            <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwords.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-ree-green/20 focus:ring-4 focus:ring-ree-green/5 rounded-2xl text-sm font-medium transition-all outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
