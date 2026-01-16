import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Users, LayoutGrid, Zap, Activity, Search, Filter, RefreshCcw, User as UserIcon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VendorOverview = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [lastRefreshed, setLastRefreshed] = useState(new Date());
    const [filters, setFilters] = useState({
        agent: 'all',
        plan: 'all',
        status: 'all'
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user._id || localStorage.getItem('userId');

    const fetchUsers = async (showLoading = true) => {
        if (!userId) return;
        if (showLoading) setLoading(true);
        try {
            // Using a full URL to ensure consistency with backend
            const response = await axios.get(`http://localhost:8080/api/agents/vendor-users/${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(Array.isArray(response.data) ? response.data : []);
            setLastRefreshed(new Date());
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // Live polling every 30 seconds for real-time feel
        const interval = setInterval(() => fetchUsers(false), 30000);
        return () => clearInterval(interval);
    }, [userId]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch =
                (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());

            const matchesAgent = filters.agent === 'all' || u.app === filters.agent;
            const matchesPlan = filters.plan === 'all' || u.plan === filters.plan;
            const matchesStatus = filters.status === 'all' || u.status === filters.status;

            return matchesSearch && matchesAgent && matchesPlan && matchesStatus;
        }).sort((a, b) => {
            const timeA = new Date(a.lastInteraction || a.joinedAt || 0).getTime();
            const timeB = new Date(b.lastInteraction || b.joinedAt || 0).getTime();
            return timeB - timeA;
        });
    }, [users, searchQuery, filters]);

    const agents = useMemo(() => ['all', ...new Set(users.map(u => u.app))], [users]);
    const plans = ['all', 'Free', 'Basic', 'Pro'];
    const statuses = ['all', 'Active', 'Completed', 'New'];

    const formatTime = (ts) => {
        if (!ts) return 'Never';
        const date = new Date(ts);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>

                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter mb-4 leading-none">User <span className="text-[#8b5cf6]">Management</span></h1>
                    <p className="text-gray-500 font-bold text-lg tracking-tight max-w-xl">View and manage all users subscribed to your agents.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={() => fetchUsers(true)}
                        className="p-4 bg-white/60 hover:bg-white text-gray-500 hover:text-[#8b5cf6] rounded-2xl border border-white transition-all shadow-sm active:scale-95 group"
                    >
                        <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" />
                        <input
                            type="text"
                            placeholder="Find User..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 w-64 shadow-sm font-bold text-sm tracking-tight"
                        />
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-6 p-6 bg-white/20 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-inner"
            >
                <div className="flex flex-wrap gap-4">
                    {/* Agent Filter */}
                    <div className="flex flex-col gap-1.5">
                        <span className="px-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">App Name</span>
                        <select
                            value={filters.agent}
                            onChange={(e) => setFilters({ ...filters, agent: e.target.value })}
                            className="bg-white/60 border border-white rounded-xl px-4 py-2 text-xs font-bold text-gray-700 outline-none hover:bg-white transition-all cursor-pointer"
                        >
                            {agents.map(a => <option key={a} value={a}>{a === 'all' ? 'All Units' : a}</option>)}
                        </select>
                    </div>

                    {/* Plan Filter */}
                    <div className="flex flex-col gap-1.5">
                        <span className="px-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">Plan</span>
                        <select
                            value={filters.plan}
                            onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
                            className="bg-white/60 border border-white rounded-xl px-4 py-2 text-xs font-bold text-gray-700 outline-none hover:bg-white transition-all cursor-pointer"
                        >
                            {plans.map(p => <option key={p} value={p}>{p === 'all' ? 'All Tiers' : p}</option>)}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-col gap-1.5">
                        <span className="px-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="bg-white/60 border border-white rounded-xl px-4 py-2 text-xs font-bold text-gray-700 outline-none hover:bg-white transition-all cursor-pointer"
                        >
                            {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All States' : s}</option>)}
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Premium Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    { label: 'Total Active Users', value: users.filter(u => u.status === 'Active').length, icon: Users, color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.2)' },
                    { label: 'Total Active Agents', value: new Set(users.map(u => u.app)).size, icon: LayoutGrid, color: '#d946ef', glow: 'rgba(217, 70, 239, 0.2)' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                        whileHover={{
                            translateY: -8,
                            boxShadow: `0 20px 40px ${stat.glow}`,
                            borderColor: stat.color
                        }}
                        className="p-10 rounded-[48px] bg-white/40 backdrop-blur-3xl border border-white/60 shadow-xl flex flex-col justify-between h-52 group relative overflow-hidden transition-all duration-500"
                    >
                        {/* Dynamic Background Glow */}
                        <div
                            className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"
                            style={{ backgroundColor: stat.color }}
                        />

                        <div className="flex justify-between items-start z-10">
                            <div className="flex flex-col gap-1">
                                <motion.h3
                                    className="text-6xl font-black text-gray-900 tracking-tighter"
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                >
                                    {stat.value}
                                </motion.h3>
                                <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.3em] pl-1">{stat.label}</p>
                            </div>

                            <motion.div
                                className="p-5 bg-white rounded-[28px] shadow-glass border border-gray-50 relative group-hover:rotate-12 transition-all duration-500"
                                style={{ color: stat.color }}
                                whileHover={{ scale: 1.1 }}
                            >
                                <stat.icon className="w-10 h-10" />
                                {/* Icon Glow */}
                                <div
                                    className="absolute inset-0 blur-lg opacity-0 group-hover:opacity-40 transition-opacity"
                                    style={{ backgroundColor: stat.color }}
                                />
                            </motion.div>
                        </div>

                        {/* Animated Bottom Line */}
                        <motion.div
                            className="h-1.5 rounded-full mt-6"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                            style={{
                                background: `linear-gradient(90deg, ${stat.color} 0%, transparent 100%)`,
                                opacity: 0.3
                            }}
                        />
                    </motion.div>
                ))}
            </div>


            {/* TABLE SECTION */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[48px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.08)] overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-white/40 border-b border-white/40 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                <th className="px-6 py-10">User ID</th>
                                <th className="px-6 py-10">User Name</th>
                                <th className="px-6 py-10">Email Address</th>
                                <th className="px-6 py-10">Subscribed Agent</th>
                                <th className="px-6 py-10">Subscription Plan</th>
                                <th className="px-6 py-10 text-right">Established</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/60">
                            {filteredUsers.map((u, idx) => (
                                <motion.tr
                                    key={u.id || idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + (idx * 0.03) }}
                                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.7)", x: 4 }}
                                    className="cursor-pointer group transition-all"
                                >
                                    <td className="px-6 py-8">
                                        <span className="text-[10px] font-mono font-bold text-[#8b5cf6] bg-[#8b5cf6]/5 px-2 py-0.5 rounded-lg">
                                            #{String(u.id).slice(-6).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-8">
                                        <span className="text-sm font-black text-gray-900 tracking-tight group-hover:text-[#8b5cf6] transition-colors">{u.name || 'Anonymous User'}</span>
                                    </td>
                                    <td className="px-6 py-8">
                                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-600 transition-colors lowercase tracking-tight">{u.email}</span>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#d946ef] animate-pulse" />
                                            <span className="text-xs font-black text-gray-800 tracking-tighter uppercase">{u.app}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${u.plan === 'Pro' ? 'bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-lg shadow-purple-500/20' :
                                            u.plan === 'Basic' ? 'bg-white text-gray-900 border-gray-200 shadow-sm' :
                                                'bg-gray-100/50 text-gray-500 border-gray-100'
                                            }`}>
                                            {u.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-8 text-right">
                                        <div className="flex flex-col items-end">
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">{new Date(u.joinedAt).toLocaleDateString()}</span>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                                    <span>{formatTime(u.lastInteraction)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && !loading && (
                    <div className="p-32 text-center flex flex-col items-center justify-center bg-white/10 relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8b5cf6]/5 rounded-full blur-[100px] -z-10" />
                        <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-[32px] flex items-center justify-center mb-8 shadow-glass border border-white">
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter uppercase">No Users Found</h3>
                        <p className="text-gray-400 font-bold text-base max-w-sm mx-auto leading-relaxed">
                            {searchQuery || filters.agent !== 'all' || filters.plan !== 'all' || filters.status !== 'all'
                                ? "No users match your current filters."
                                : "You don't have any active users yet."
                            }
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="p-32 text-center flex flex-col items-center justify-center bg-white/10">
                        <div className="relative w-20 h-20 mb-8">
                            <div className="absolute inset-0 border-4 border-[#8b5cf6]/20 border-t-[#8b5cf6] rounded-full animate-spin" />
                            <div className="absolute inset-3 border-4 border-[#d946ef]/20 border-b-[#d946ef] rounded-full animate-spin-reverse" />
                        </div>
                        <p className="text-[11px] font-black text-[#8b5cf6] uppercase tracking-[0.5em] animate-pulse">Loading Users...</p>
                    </div>
                )}
            </motion.div>

        </div>
    );
};

// Force HMR Update
export default VendorOverview;
