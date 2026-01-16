import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, CreditCard, Calendar, Clock, BarChart3, Wallet, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

const VendorRevenue = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const [stats, setStats] = useState({
        grossRevenue: 0,
        platformFees: 0,
        payouts: 0,
        netEarnings: 0,
        pending: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user._id || localStorage.getItem('userId');

    useEffect(() => {
        const fetchRevenue = async () => {
            if (!userId) return;
            try {
                const response = await axios.get(`http://localhost:8080/api/agents/vendor/${userId}/transactions`);
                setStats(response.data.summary);
                setTransactions(response.data.transactions);
            } catch (error) {
                console.error("Failed to fetch revenue", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRevenue();
    }, [userId]);

    // Format helpers
    const fmt = (num) => (num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Real Data Mapped
    const overall = {
        grossRevenue: fmt(stats.grossRevenue),
        platformFees: fmt(stats.platformFees),
        payouts: fmt(stats.payouts),
        netEarnings: fmt(stats.netEarnings),
        pending: fmt(stats.pending)
    };

    // Aggregated Data for History Tab
    const aggregatedStats = transactions.reduce((acc, t) => {
        const agentName = t.description || 'Unnamed Agent';
        if (!acc[agentName]) {
            acc[agentName] = { name: agentName, monthly: 0, yearly: 0, total: 0 };
        }
        const amount = t.amount || 0;
        const date = new Date(t.date);
        const now = new Date();

        // Total
        acc[agentName].total += amount;

        // Yearly
        if (date.getFullYear() === now.getFullYear()) {
            acc[agentName].yearly += amount;

            // Monthly
            if (date.getMonth() === now.getMonth()) {
                acc[agentName].monthly += amount;
            }
        }

        return acc;
    }, {});

    const historyList = Object.values(aggregatedStats);

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">Revenue & <span className="text-[#8b5cf6]">Payout.</span></h1>
                    <p className="text-gray-500 font-bold text-lg tracking-tight max-w-xl">Track your earnings, payouts, and financial performance.</p>
                </div>

                {/* Tabs */}
                <div className="flex p-1.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-[20px] shadow-sm">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 text-xs font-black uppercase tracking-widest rounded-[16px] transition-all relative ${activeTab === 'overview'
                            ? 'text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-white/40'
                            }`}
                    >
                        {activeTab === 'overview' && (
                            <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#8b5cf6] rounded-[16px]" />
                        )}
                        <span className="relative z-10">Overview</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 text-xs font-black uppercase tracking-widest rounded-[16px] transition-all relative ${activeTab === 'history'
                            ? 'text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-white/40'
                            }`}
                    >
                        {activeTab === 'history' && (
                            <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#8b5cf6] rounded-[16px]" />
                        )}
                        <span className="relative z-10">Transaction History</span>
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    /* OVERVIEW TAB */
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        {/* Financial Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Total Revenue */}
                            <motion.div
                                whileHover={{ y: -8, scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="p-7 rounded-[32px] bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/5"
                            >
                                <div className="absolute top-0 right-0 w-80 h-80 bg-[#8b5cf6]/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-[#8b5cf6]/30 transition-all duration-700" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-500/10 rounded-full blur-[60px] -ml-10 -mb-10" />

                                <div className="relative z-10 h-full flex flex-col justify-center">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xl border border-white/10 shadow-inner">
                                                <DollarSign size={20} className="text-[#8b5cf6]" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">Total Revenue</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl lg:text-6xl font-black tracking-tighter text-white">${overall.grossRevenue}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Profit (50% of Gross) */}
                            <motion.div
                                whileHover={{ y: -8, scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="p-7 rounded-[32px] bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/5"
                            >
                                <div className="absolute top-0 right-0 w-80 h-80 bg-[#d946ef]/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-[#d946ef]/20 transition-all duration-700" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#8b5cf6]/5 rounded-full blur-[60px] -ml-10 -mb-10" />

                                <div className="relative z-10 h-full flex flex-col justify-center">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xl border border-white/10 shadow-inner">
                                                <BarChart3 size={20} className="text-[#d946ef]" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">Net Profit</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl lg:text-6xl font-black tracking-tighter text-white">${fmt(stats.grossRevenue * 0.5)}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* App-wise Breakdown */}
                        <div className="bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[48px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
                            <div className="px-10 py-8 border-b border-gray-100 bg-white/40 flex items-center justify-between">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Revenue Source <span className="text-[#8b5cf6]">Breakdown.</span></h3>
                                <div className="px-4 py-1.5 bg-[#8b5cf6]/10 rounded-full">
                                    <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest">50% Platform Fee Applied</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Agent Identity</th>
                                            <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">Net Earning</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.length > 0 ? (
                                            transactions.map((t) => (
                                                <tr key={t._id} className="hover:bg-white/80 transition-all group">
                                                    <td className="px-10 py-7">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-1.5 h-6 bg-[#8b5cf6] rounded-full group-hover:scale-y-125 transition-transform" />
                                                            <span className="font-black text-gray-900 tracking-tight text-lg">{t.description || "Unnamed Agent"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-7 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-black text-emerald-600 text-2xl tracking-tighter">${fmt(t.amount * 0.5)}</span>
                                                            <span className="text-[10px] font-bold text-gray-400 line-through">${fmt(t.amount)}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="px-10 py-16 text-center text-gray-400 font-black uppercase tracking-widest text-sm italic">Synchronizing financial protocols...</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* TRANSACTION HISTORY TAB */
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] overflow-hidden"
                    >
                        <div className="px-8 py-6 border-b border-white/60 bg-white/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Transaction History</h3>
                                <p className="text-xs font-bold text-gray-500 mt-1">A detailed overview of your revenue streams, aggregated by agent performance.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/20">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                            Agent Name
                                        </th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                                            Monthly Transaction
                                        </th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                                            Yearly Transaction
                                        </th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                                            Total Transaction
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/40">
                                    {historyList.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-white/40 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                                                        <BarChart3 size={14} className="text-[#8b5cf6]" />
                                                    </div>
                                                    <span className="font-bold text-gray-900">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="font-bold text-emerald-600 tracking-tight">${fmt(item.monthly)}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="font-bold text-blue-600 tracking-tight">${fmt(item.yearly)}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="font-black text-gray-900 text-lg">${fmt(item.total)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {historyList.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-12 text-center text-gray-400 font-bold text-sm">No recorded transactions for your agents.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VendorRevenue;
