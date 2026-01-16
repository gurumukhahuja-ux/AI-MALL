import React, { useState, useEffect } from 'react';
import {
    Activity,
    Search,
    ShoppingBag,
    ShieldCheck,
    Globe,
    Zap,
    Users,
    DollarSign,
    Box,
    CheckCircle,
    ArrowUpRight,
    Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import CreateAppModal from './CreateAppModal';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdminOverview = () => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Growth',
                data: [12, 19, 15, 25, 22, 30, 45, 50, 48, 60, 75, 90],
                fill: true,
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderColor: '#8b5cf6',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 0
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        scales: {
            x: { display: false },
            y: { display: false }
        }
    };

    const fetchStats = async () => {
        // Fetching stats...
        try {
            const [data, allVendorsData] = await Promise.all([
                apiService.getAdminOverviewStats(),
                apiService.getAllVendors('approved')
            ]);

            const approvedCount = allVendorsData?.count || 0;

            setStatsData({
                ...data,
                // Add activeVendors count to the stats data state
                activeVendors: approvedCount
            });
        } catch (err) {
            console.error("Failed to fetch admin overview stats:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleCreateApp = async (formData) => {
        try {
            const payload = { ...formData, url: formData.agentUrl };
            delete payload.agentUrl;
            await apiService.createAgent(payload);
            await fetchStats();
        } catch (error) {
            console.error("Error creating agent:", error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center bg-transparent gap-4">
                <div className="w-16 h-16 rounded-[24px] bg-[#8b5cf6]/20 flex items-center justify-center animate-spin">
                    <Activity className="w-8 h-8 text-[#8b5cf6]" />
                </div>
                <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.4em]">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 pb-24"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter mb-0.5">Dashboard Overview</h1>
                    <p className="text-gray-500 font-medium text-sm">Welcome back, A-Series™. Here’s what’s happening today.</p>
                </div>

                <div className="relative group w-full lg:w-80">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-white/40 backdrop-blur-md border border-white/60 rounded-[16px] px-3 py-2.5 pl-9 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all font-medium text-sm text-gray-900 placeholder-gray-400"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" />
                </div>
            </div>

            {/* Analysis Chart */}
            <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-8 shadow-sm overflow-hidden relative group h-48">
                <div className="absolute inset-0 z-0 opacity-50">
                    <Line data={chartData} options={chartOptions} />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Growth Analysis</span>
                    </div>
                    <div>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">+84.2%</h4>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Growth optimized this month</p>
                    </div>
                </div>
            </div>

            {/* Performance Snapshot */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 border-l-4 border-[#8b5cf6] pl-3">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] relative top-[1px]">Performance Snapshot</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Pending Approvals - NEW */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[24px] p-5 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] transition-all group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#8b5cf6] transition-colors">Pending Approvals</span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                                <Activity className="w-2.5 h-2.5" /> Action
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{statsData?.pendingApprovals || 0}</p>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#8b5cf6] transition-colors">
                                <CheckCircle className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Total Users */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[24px] p-5 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] transition-all group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#8b5cf6] transition-colors">Total Users</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{statsData?.totalUsers || 0}</p>
                        </div>
                    </motion.div>

                    {/* Total Vendors */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[24px] p-5 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] transition-all group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#8b5cf6] transition-colors">Total Vendors</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{statsData?.totalVendors || 0}</p>
                        </div>
                    </motion.div>

                    {/* Registered Vendors */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[24px] p-5 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] transition-all group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#8b5cf6] transition-colors">Registered Vendors</span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <Activity className="w-2.5 h-2.5" /> Active
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{statsData?.activeVendors || 0}</p>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#8b5cf6] transition-colors">
                                <ShieldCheck className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                            </div>

                        </div>
                    </motion.div>

                    {/* Total Revenue */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[24px] p-5 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] transition-all group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#8b5cf6] transition-colors">Total Revenue</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{statsData?.totalRevenue?.toLocaleString() || '0'}</p>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#8b5cf6] transition-colors">
                                <DollarSign className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                            </div>

                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 border-l-4 border-[#8b5cf6] pl-3">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] relative top-[1px]">Financial Overview</h3>
                </div>

                <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[28px] p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="flex justify-between items-center mb-5 relative z-10">
                        <div className="flex items-center gap-2 text-[#8b5cf6]">
                            <Activity className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Financial Overview</span>
                        </div>
                        <div className="flex gap-3">
                            <button className="text-[9px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center gap-2">
                                Invoice <ArrowUpRight className="w-2.5 h-2.5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                        <div className="bg-gray-50/50 rounded-[20px] p-4 border border-gray-100 hover:bg-white hover:shadow-lg transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600">Gross Sales</p>
                                <Wallet className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#8b5cf6]" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter">₹{statsData?.financials?.grossSales || 0}</p>
                        </div>

                        <div className="bg-gray-50/50 rounded-[20px] p-4 border border-gray-100 hover:bg-white hover:shadow-lg transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600">Platform Fee (50%)</p>
                                <Wallet className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#8b5cf6]" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter">₹{statsData?.financials?.platformFee || 0}</p>
                        </div>

                        <div className="bg-gray-50/50 rounded-[20px] p-4 border border-gray-100 hover:bg-white hover:shadow-lg transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600">Net Earnings</p>
                                <Wallet className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#8b5cf6]" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter">₹{statsData?.financials?.netEarnings || 0}</p>
                        </div>

                        <div className="pl-5 border-l border-gray-200/50 flex flex-col justify-between py-1">
                            <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Status</p>
                                <span className="inline-block bg-orange-100/80 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">{statsData?.financials?.status || 'Active'}</span>
                            </div>
                            <div className="mt-2">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Next Payout</p>
                                <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                    {statsData?.financials?.nextPayout || 'Pending Sales'}
                                    <span className={`w-1.5 h-1.5 rounded-full ${statsData?.financials?.grossSales > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CreateAppModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateApp}
            />
        </motion.div>
    );
};

export default AdminOverview;
