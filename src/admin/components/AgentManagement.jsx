import React, { useState, useEffect } from 'react';
import { Activity, Loader2, Edit2, EyeOff, Plus, Search, Filter, Package, Zap, ArrowRight, ShieldCheck, Layers, Check, Trash2 } from 'lucide-react';
import apiService from '../../services/apiService';
import CreateAppModal from './CreateAppModal';
import AppDetails from './AppDetails';
import { motion, AnimatePresence } from 'framer-motion';

const AgentManagement = () => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [newAppName, setNewAppName] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null); // App to be deleted
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState({ type: '', message: '' });

    const fetchStats = async () => {
        try {
            const data = await apiService.getAdminOverviewStats();
            setStatsData(data);
        } catch (err) {
            console.error("Failed to fetch admin overview stats/inventory:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleCreateApp = async (formData) => {
        try {
            const payload = {
                ...formData,
                url: formData.agentUrl,
                reviewStatus: 'Approved',
                status: 'Live'
            };
            delete payload.agentUrl;

            console.log('Creating agent with payload:', payload);
            const result = await apiService.createAgent(payload);
            console.log('Agent created:', result);

            setNewAppName(formData.agentName);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
            await fetchStats();
        } catch (error) {
            console.error("Error creating agent:", error);
            alert("Failed to create app. Please check the console for details.");
            throw error;
        }
    };

    // Helper to safely render pricing
    const renderPricing = (pricing) => {
        if (!pricing) return 'Free';
        if (typeof pricing === 'string') return pricing;
        if (typeof pricing === 'object') {
            // Adjust this based on your actual object structure, e.g. pricing.type or pricing.amount
            return pricing.amount || pricing.type || 'Custom';
        }
        return 'Unknown';
    };

    const filteredInventory = statsData?.inventory?.filter(app => {
        // Exclude only mocks if needed, but the user wants FULL control
        if (app.id?.startsWith('mock-') || app._id?.startsWith('mock-')) return false;

        const matchesSearch = app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.status?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'All' ||
            app.status === filterStatus ||
            app.category === filterStatus;

        return matchesSearch && matchesFilter;
    }) || [];

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-[24px] bg-[#8b5cf6]/20 flex items-center justify-center animate-spin">
                    <Loader2 className="w-8 h-8 text-[#8b5cf6]" />
                </div>
                <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.4em]">Loading Agents...</p>
            </div>
        );
    }

    if (selectedApp) {
        return (
            <AppDetails
                app={selectedApp}
                onBack={() => setSelectedApp(null)}
                onDelete={() => {
                    fetchStats();
                    setSelectedApp(null);
                }}
                onUpdate={() => fetchStats()}
                isAdmin={true}
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 pb-24"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">AI-MALL Agents</h1>
                    <p className="text-gray-500 font-medium text-xs">Manage your AI agent inventory and deployments</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gray-900 text-white px-6 py-2 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-[#8b5cf6] hover:shadow-lg hover:shadow-[#8b5cf6]/20 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Create New Agent
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-emerald-50 border border-emerald-100 rounded-[24px] p-6 flex items-center justify-between shadow-sm"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Success!</h3>
                                <p className="text-emerald-700 font-medium text-sm">Agent "{newAppName}" has been deployed successfully.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:text-emerald-900"
                        >
                            Dismiss
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
                <div className="p-5 border-b border-white/60 bg-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative group w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search agents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/40 backdrop-blur-md border border-white/60 rounded-[16px] py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/30 transition-all outline-none placeholder:text-gray-400"
                        />
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" />
                    </div>

                    <div className="flex gap-3 relative z-20">
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`px-6 py-3 bg-white/40 border border-white/60 rounded-[16px] text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:bg-white/60 transition-all flex items-center gap-2 ${showFilterMenu ? 'bg-white/60 text-[#8b5cf6] ring-2 ring-[#8b5cf6]/10' : ''}`}
                            >
                                <Filter className="w-3 h-3" />
                                {filterStatus === 'All' ? 'Filter' : filterStatus}
                            </button>

                            <AnimatePresence>
                                {showFilterMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl z-50 overflow-hidden p-1.5"
                                    >
                                        {['All', 'Live', 'Draft', 'Coming Soon', 'Business OS', 'Sales & Marketing', 'HR & Finance', 'Productivity'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    setFilterStatus(status);
                                                    setShowFilterMenu(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${filterStatus === status
                                                    ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]'
                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                            >
                                                {status}
                                                {filterStatus === status && <Check className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/30 border-b border-white/60">
                            <tr>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Agent Name</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Plans (M/Y)</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Users / Status</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/60">
                            {filteredInventory.length > 0 ? (
                                filteredInventory.map((app) => (
                                    <tr
                                        key={app.id}
                                        onClick={() => setSelectedApp(app)}
                                        className="hover:bg-white/40 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#d946ef]/10 to-[#8b5cf6]/10 flex items-center justify-center border border-white/60 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                    <Package className="w-4 h-4 text-[#8b5cf6]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-[#8b5cf6] transition-colors">{app.name || 'Unnamed App'}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">ID: {app.id?.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">M:</span>
                                                    <span className="text-xs font-bold text-gray-900">
                                                        {app.pricing?.plans?.find(p => p.billingCycle === 'monthly')?.amount ? `₹${app.pricing.plans.find(p => p.billingCycle === 'monthly').amount}` : 'Free'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Y:</span>
                                                    <span className="text-xs font-bold text-gray-900">
                                                        {app.pricing?.plans?.find(p => p.billingCycle === 'yearly')?.amount ? `₹${app.pricing.plans.find(p => p.billingCycle === 'yearly').amount}` : 'Free'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="flex items-center gap-2 px-2 py-1 bg-white/40 border border-white/60 rounded-lg">
                                                    <Activity className="w-3 h-3 text-[#8b5cf6]" />
                                                    <span className="text-[10px] font-black text-gray-900">{app.usageCount || 0}</span>
                                                </div>
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${app.status === 'Live' || app.status === 'Active'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-gray-50 text-gray-500 border-gray-100'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'Live' || app.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                                    {app.status || 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfirmDelete(app);
                                                    }}
                                                    className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all hover:shadow-md"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                                                    className="group/btn relative flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white/20 hover:bg-white rounded-xl text-gray-400 hover:text-gray-900 transition-all hover:shadow-md border border-white/60"
                                                >
                                                    <span className="text-[9px] font-black uppercase tracking-widest hidden group-hover/btn:block">Manage</span>
                                                    <ArrowRight className="w-3 h-3 group-hover/btn:text-[#8b5cf6]" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-10 py-32 text-center opacity-50">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center border border-white shadow-sm">
                                                <Zap className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">No agents found in AI-MALL</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateAppModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateApp}
            />

            {/* Custom Premium Deletion Modal */}
            <AnimatePresence>
                {confirmDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmDelete(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[32px] w-full max-w-md p-8 relative z-10 shadow-2xl border border-white/20"
                        >
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
                                <Trash2 className="w-8 h-8" />
                            </div>

                            <div className="text-center mb-8">
                                <h3 className="text-xl font-black text-gray-900 mb-2">Delete Agent?</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                    You are about to permanently delete <span className="text-gray-900 font-bold">"{confirmDelete.name || confirmDelete.agentName}"</span>.
                                    This will remove all associated sessions, messages, and user mappings.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-6 py-3 rounded-2xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            setIsDeleting(true);
                                            await apiService.deleteAgent(confirmDelete.id || confirmDelete._id);
                                            setConfirmDelete(null);
                                            fetchStats();
                                            setDeleteStatus({ type: 'success', message: 'Agent deleted successfully' });
                                            setTimeout(() => setDeleteStatus({ type: '', message: '' }), 5000);
                                        } catch (error) {
                                            setDeleteStatus({ type: 'error', message: error.response?.data?.error || error.message });
                                        } finally {
                                            setIsDeleting(false);
                                        }
                                    }}
                                    className="px-6 py-3 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Delete Agent'}
                                </button>
                            </div>

                            {deleteStatus.message && deleteStatus.type === 'error' && (
                                <p className="text-center text-red-500 text-[10px] font-bold mt-4 animate-pulse">
                                    {deleteStatus.message}
                                </p>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {deleteStatus.message && deleteStatus.type === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 right-8 z-[100] bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10"
                    >
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <Check className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">{deleteStatus.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AgentManagement;
