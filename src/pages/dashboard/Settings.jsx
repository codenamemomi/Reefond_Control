import React, { useState, useEffect, useCallback } from 'react';
import {
    Building2,
    Users,
    Settings as SettingsIcon,
    Globe,
    Shield,
    Plus,
    Search,
    Loader2,
    CheckCircle2,
    X,
    Mail,
    Trash2,
    ArrowRight,
    ExternalLink
} from 'lucide-react';
import { organizationService } from '../../api/organizations';
import { clsx } from 'clsx';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const TabButton = ({ active, icon, label, onClick }) => {
    const TabIcon = icon;
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex items-center gap-2 px-6 py-4 border-b-2 transition-all font-black text-[10px] uppercase tracking-widest",
                active
                    ? "border-ree-green text-ree-green bg-ree-green/[0.02]"
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
        >
            <TabIcon className="w-4 h-4" />
            {label}
        </button>
    );
};

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [org, setOrg] = useState(null);
    const [team, setTeam] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);
    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);

    const activeUser = JSON.parse(localStorage.getItem('user') || '{}');
    const orgId = activeUser.organization_id;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'general') {
                const data = await organizationService.getOrganization(orgId);
                setOrg(data);
            } else if (activeTab === 'settings') {
                const [orgData] = await Promise.all([
                    organizationService.getOrganization(orgId),
                    organizationService.getOrganizationSettings(orgId)
                ]);
                setOrg(orgData);
            } else if (activeTab === 'team') {
                const data = await organizationService.getOrganizationUsers(orgId);
                setTeam(data || []);
            } else if (activeTab === 'workspaces') {
                const data = await organizationService.getOrganizations();
                setWorkspaces(data.items || []);
            }
        } catch (error) {
            console.error("Error fetching settings data:", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, orgId]);

    useEffect(() => {
        if (orgId) fetchData();
    }, [fetchData, orgId]);

    const handleUpdateOrg = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await organizationService.updateOrganization(orgId, {
                name: org.name,
                legal_name: org.legal_name,
            });
            await fetchData();
            alert('Organization details updated successfully.');
        } catch (error) {
            console.error("Error updating organization:", error);
            alert('Failed to update organization.');
        } finally {
            setLoading(false);
        }
    };

    const handleInviteMember = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const role = formData.get('role');
        try {
            setLoading(true);
            await organizationService.createInvitation(orgId, { email, role });
            alert('Invitation sent successfully.');
            e.target.reset();
        } catch (error) {
            console.error("Error sending invitation:", error);
            alert('Failed to send invitation.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterWorkspace = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            legal_name: formData.get('legal_name'),
            registration_number: formData.get('registration_number'),
            tax_identification_number: formData.get('tin'),
        };
        try {
            setLoading(true);
            await organizationService.createOrganization(data);
            setIsOrgModalOpen(false);
            await fetchData();
            alert('Workspace registered successfully.');
        } catch (error) {
            console.error("Error registering workspace:", error);
            alert('Failed to register workspace.');
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchWorkspace = (ws) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.organization_id = ws.id;
        user.organization_name = ws.name;
        localStorage.setItem('user', JSON.stringify(user));
        window.location.reload();
    };

    return (
        <div className="max-w-6xl space-y-10 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 italic">Company Settings</h1>
                <p className="text-slate-500 font-medium">Manage your workspace identity, team configurations, and account policies.</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden sticky top-24 z-10 backdrop-blur-md">
                <div className="flex overflow-x-auto no-scrollbar">
                    <TabButton
                        active={activeTab === 'general'}
                        icon={Building2}
                        label="General Profile"
                        onClick={() => setActiveTab('general')}
                    />
                    <TabButton
                        active={activeTab === 'team'}
                        icon={Users}
                        label="Team Management"
                        onClick={() => setActiveTab('team')}
                    />
                    <TabButton
                        active={activeTab === 'settings'}
                        icon={SettingsIcon}
                        label="System Settings"
                        onClick={() => setActiveTab('settings')}
                    />
                    <TabButton
                        active={activeTab === 'workspaces'}
                        icon={Globe}
                        label="All Workspaces"
                        onClick={() => setActiveTab('workspaces')}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-32 gap-4">
                        <Loader2 className="w-12 h-12 text-ree-green animate-spin" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Settings Ledger...</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'general' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                                        <div className="flex items-center gap-6 pb-6 border-b border-slate-50">
                                            <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                                                <Building2 className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 mb-1">{org?.name}</h3>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Organization UID: {org?.id?.split('-')[0]}</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleUpdateOrg} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input label="Company Name" value={org?.name || ''} onChange={e => setOrg({ ...org, name: e.target.value })} />
                                                <Input label="Legal Name" value={org?.legal_name || ''} onChange={e => setOrg({ ...org, legal_name: e.target.value })} />
                                                <Input label="Registration Number" value={org?.registration_number || ''} readOnly />
                                                <Input label="Tax ID (TIN)" value={org?.tax_identification_number || ''} readOnly />
                                            </div>
                                            <div className="flex justify-end">
                                                <button type="submit" className="bg-ree-green text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-ree-light transition-all shadow-xl shadow-ree-green/20">
                                                    Save Changes
                                                </button>
                                            </div>
                                            <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 border border-amber-100/50">
                                                <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                <p className="text-xs font-medium text-amber-700 leading-relaxed">
                                                    Some official company details are locked by the system regulator. Contact compliance to request administrative changes.
                                                </p>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-ree-green p-8 rounded-[2rem] text-white shadow-xl shadow-ree-green/20">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                                                <Shield className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Pro Plan</span>
                                        </div>
                                        <h4 className="text-lg font-black mb-2 italic">Standard Verification</h4>
                                        <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">Your organization is fully verified and compliant with Ree-fond standards.</p>
                                        <button className="w-full py-3 bg-white text-ree-green rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                                            View Certificate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div className="space-y-8">
                                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <h3 className="font-black text-slate-900 italic text-xl mb-6">Invite Team Member</h3>
                                    <form onSubmit={handleInviteMember} className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-[2]">
                                            <Input name="email" type="email" placeholder="colleague@company.com" required />
                                        </div>
                                        <div className="flex-1">
                                            <select name="role" className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-ree-green/30 transition-all font-medium text-sm">
                                                <option value="member">Member</option>
                                                <option value="admin">Admin</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="flex-1 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 px-6">
                                            <Plus className="w-4 h-4" />
                                            Invite
                                        </button>
                                    </form>
                                </div>

                                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="p-8 border-b border-slate-50">
                                        <h3 className="font-black text-slate-900 italic text-xl">Team Directory</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage access for {team.length} specialists</p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50/50">
                                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User / Identity</th>
                                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Access Role</th>
                                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {team.map((member) => (
                                                    <tr key={member.id} className="group hover:bg-slate-50/50 transition-all">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase">
                                                                    {member.name?.[0] || 'U'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-900 leading-tight mb-1">{member.name}</p>
                                                                    <p className="text-xs text-slate-400 font-medium">{member.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 text-slate-500 rounded-lg">
                                                                {member.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span className="text-xs font-bold text-slate-600">Active</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'workspaces' && (
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="relative flex-1 max-w-md group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-ree-green transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search Workspace ID..."
                                            className="w-full pl-11 pr-6 py-3 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:border-ree-green/30 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsOrgModalOpen(true)}
                                        className="bg-ree-green text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Register Workspace
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {workspaces.map((ws) => (
                                        <div key={ws.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className={clsx(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                                    ws.id === orgId ? "bg-ree-green shadow-ree-green/20" : "bg-slate-900 shadow-slate-900/20"
                                                )}>
                                                    <Building2 className="w-7 h-7" />
                                                </div>
                                                <div className="flex gap-2">
                                                    {ws.id === orgId && (
                                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Active</span>
                                                    )}
                                                </div>
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 mb-1 group-hover:text-ree-green transition-colors">{ws.name}</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{ws.type?.replace(/_/g, ' ')}</p>

                                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-slate-300" />
                                                    <span className="text-xs font-black text-slate-600">User Controlled</span>
                                                </div>
                                                {ws.id !== orgId ? (
                                                    <button
                                                        onClick={() => handleSwitchWorkspace(ws)}
                                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ree-green hover:gap-3 transition-all"
                                                    >
                                                        Switch
                                                        <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                ) : (
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Current</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="max-w-2xl bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10">
                                <div>
                                    <h3 className="font-black text-slate-900 italic text-xl mb-6">Organization Policies</h3>

                                    <div className="space-y-6">
                                        {[
                                            { title: 'Automatic Filing Review', desc: 'Regulator review process initiated on submission.' },
                                            { title: 'Refund Claim SLAs', desc: 'Standard 30-day processing window enabled.' },
                                            { title: 'External API Access', desc: 'Organization-level developer keys management.' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start justify-between gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100/50">
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 mb-1">{item.title}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                                                </div>
                                                <div className="w-12 h-6 bg-ree-green rounded-full relative cursor-pointer">
                                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isOrgModalOpen}
                onClose={() => setIsOrgModalOpen(false)}
                title="Register New Workspace"
            >
                <form onSubmit={handleRegisterWorkspace} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input name="name" label="Workspace Name" placeholder="e.g. Acme Corp" required />
                        <Input name="legal_name" label="Legal Entity Name" placeholder="Full Registered Name" required />
                        <Input name="registration_number" label="Registration Number" placeholder="RC123456" required />
                        <Input name="tin" label="Tax ID" placeholder="TIN Number" required />
                    </div>
                    <div className="pt-6 border-t border-slate-50 flex gap-4">
                        <button type="button" onClick={() => setIsOrgModalOpen(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-500 uppercase tracking-widest text-xs">Cancel</button>
                        <button type="submit" className="flex-[2] py-4 bg-ree-green text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-ree-green/20">Initialize Workspace</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Settings;
