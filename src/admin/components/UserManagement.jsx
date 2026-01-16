import React, { useState, useEffect } from 'react';
import { Ban, Search, User, Loader2, Bot, ShieldCheck, ChevronDown, ChevronUp, UserCheck, Activity } from 'lucide-react';
import apiService from '../../services/apiService';
import { useToast } from '../../Components/Toast/ToastContext';
import { motion } from 'framer-motion';

const UserManagement = () => {
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState({ total: 0, active: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedUser, setExpandedUser] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchUsers(), fetchStats()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await apiService.getAdminOverviewStats();
            // Assuming getAdminOverviewStats returns the legacy object for now, 
            // or I can call my specific endpoint if I want. 
            // Let's use the individual endpoint for accuracy.
            const res = await apiService.getAdminUserStats();
            setUserStats(res);
        } catch (err) {
            console.error("Failed to fetch user stats", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await apiService.getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const toggleExpand = (userId) => {
        if (expandedUser === userId) {
            setExpandedUser(null);
        } else {
            setExpandedUser(userId);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBlockUser = async (userId, currentStatus) => {
        try {
            await apiService.toggleBlockUser(userId, !currentStatus);
            // Optimistic update or refetch
            setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !currentStatus, status: !currentStatus ? 'Blocked' : (u.isVerified ? 'Active' : 'Pending') } : u));
            toast.success(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully`);
        } catch (err) {
            console.error("Block/Unblock failed:", err);
            toast.error("Failed to update user status: " + (err.response?.data?.error || err.message));
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-[24px] bg-[#8b5cf6]/20 flex items-center justify-center animate-spin">
                <Loader2 className="w-8 h-8 text-[#8b5cf6]" />
            </div>
            <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.4em]">Loading Users...</p>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 pb-24"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">User Management</h2>
                    <p className="text-gray-500 font-medium text-xs">Manage platform users, roles, and subscriptions</p>
                </div>

                <div className="relative group w-full md:w-80">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#d946ef]/20 to-[#8b5cf6]/20 rounded-[24px] blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="relative w-full bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[20px] px-5 py-3 pl-10 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all font-medium text-xs text-gray-900 placeholder-gray-400"
                    />
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/40 backdrop-blur-md p-6 rounded-[32px] border border-white/60 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Users</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{userStats.total || 0}</p>
                </div>

                <div className="bg-white/40 backdrop-blur-md p-6 rounded-[32px] border border-white/60 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Now</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{userStats.active || 0}</p>
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/60 bg-white/20">
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Role</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Subscriptions</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Total Spent</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/60">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <React.Fragment key={user.id}>
                                        <tr className="hover:bg-white/40 transition-colors group">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center text-white font-black shadow-lg">
                                                        {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" /> : user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                                                        <p className="text-[10px] font-medium text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${user.role === 'admin' ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20' : 'bg-gray-100 text-gray-500 border-gray-200'} `}>
                                                    {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <button
                                                    onClick={() => toggleExpand(user.id)}
                                                    className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none px-2 py-1 rounded-lg border ${expandedUser === user.id ? 'bg-white border-gray-200 shadow-sm' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/50 hover:text-gray-600'}`}
                                                >
                                                    <span>{user.agents?.length || 0} Agents</span>
                                                    {expandedUser === user.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${user.isBlocked ? 'bg-red-50 text-red-600 border-red-100' : (user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100')}`}>
                                                    <div className={`w-1 h-1 rounded-full ${user.isBlocked ? 'bg-red-500' : (user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500')}`} />
                                                    {user.isBlocked ? 'Blocked' : user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right font-black text-gray-900 text-xs">
                                                {formatCurrency(user.spent)}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleBlockUser(user.id, user.isBlocked)}
                                                        className={`p-1.5 rounded-lg transition-all ${user.isBlocked ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                                                        title={user.isBlocked ? "Unblock User" : "Block User"}
                                                    >
                                                        <Ban className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedUser === user.id && (
                                            <tr className="bg-white/30 border-b border-white/60">
                                                <td colSpan="6" className="px-8 py-6">
                                                    <div className="bg-white/50 rounded-2xl p-6 border border-white/60 shadow-inner">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Active Subscriptions</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {user.agents && user.agents.length > 0 ? (
                                                                user.agents.map((agent, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                                                <Bot className="w-4 h-4 text-gray-400" />
                                                                            </div>
                                                                            <span className="text-sm font-bold text-gray-900 line-clamp-1">{agent.agentName || agent.name}</span>
                                                                        </div>
                                                                        {(() => {
                                                                            const priceType = typeof agent.pricing === 'object' ? agent.pricing?.type : agent.pricing;
                                                                            return (
                                                                                <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-wider ${priceType === 'Pro' ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]' : priceType === 'Basic' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                                                    {priceType || 'Free'}
                                                                                </span>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="col-span-full p-4 text-center text-sm font-medium text-gray-400 italic">No active subscriptions found</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-[2rem] bg-gray-50 border border-white flex items-center justify-center shadow-inner">
                                                <UserCheck className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 text-lg mb-1">No users found.</p>
                                                <p className="text-gray-500 font-medium text-sm">Try adjusting your search terms.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default UserManagement;
