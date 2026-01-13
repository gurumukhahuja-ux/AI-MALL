import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, Mail, UserPlus, Search, Loader2, Trash2 } from 'lucide-react';
import apiService from '../../services/apiService';
import { useToast } from '../../Components/Toast/ToastContext';
import { motion } from 'framer-motion';

const AccessControl = () => {
    const toast = useToast();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAdminTeam();
            setAdmins(data);
        } catch (err) {
            console.error("Failed to fetch admin team:", err);
            toast.error("Failed to fetch administrative team");
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        if (!newAdminEmail.trim()) return;

        try {
            setAdding(true);
            await apiService.addAdmin(newAdminEmail);
            toast.success("Admin added successfully");
            setNewAdminEmail('');
            fetchAdmins();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to add admin");
        } finally {
            setAdding(false);
        }
    };

    const filteredAdmins = admins.filter(admin =>
        admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-[24px] bg-[#3b82f6]/20 flex items-center justify-center animate-spin">
                    <Loader2 className="w-8 h-8 text-[#3b82f6]" />
                </div>
                <p className="text-[10px] font-black text-[#3b82f6] uppercase tracking-[0.4em]">Loading Admin Team...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 pb-24"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Administrative Team</h2>
                    <p className="text-gray-500 font-medium text-xs">Manage your platform administrators and their access</p>
                </div>

                <div className="relative group w-full md:w-80">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-[24px] blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <input
                        type="text"
                        placeholder="Search team..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="relative w-full bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[20px] px-5 py-3 pl-10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-xs text-gray-900 placeholder-gray-400"
                    />
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Admin Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] p-8 shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                            <UserPlus className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Invite Administrator</h3>
                        <p className="text-gray-500 font-medium text-xs leading-relaxed mb-8">
                            Enter the email address of the user you want to promote to administrator. They must have an existing account.
                        </p>

                        <form onSubmit={handleAddAdmin} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        value={newAdminEmail}
                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                        placeholder="admin@ai-mall.in"
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 pl-12 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-medium text-sm text-gray-900"
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={adding || !newAdminEmail}
                                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-900/10 hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                {adding ? 'Processing...' : 'Assign Privileges'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Team List Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-white/60 bg-white/20">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 tracking-tight">Active Administrators</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{admins.length} Personnel Found</p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-white/60 max-h-[600px] overflow-y-auto no-scrollbar">
                            {filteredAdmins.length > 0 ? (
                                filteredAdmins.map((admin) => (
                                    <div key={admin._id} className="p-6 hover:bg-white/40 transition-all group flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-blue-500/10 group-hover:rotate-6 transition-transform">
                                                {admin.name?.charAt(0) || <Shield className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-gray-900 tracking-tight">{admin.name || 'Administrator'}</h4>
                                                    <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest border border-blue-100">Super</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-gray-400">{admin.email}</span>
                                                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                                    <span className="text-[10px] font-bold text-gray-400">Joined {new Date(admin.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                title="Revoke Access"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center">
                                    <Shield className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching personnel</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AccessControl;
