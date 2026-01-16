import React, { useState, useEffect } from 'react';
import { Search, Loader2, Clock, CheckCircle, AlertCircle, User, Mail, Send, X, Globe, UserCheck, MessageSquare } from 'lucide-react';
import apiService from '../../services/apiService';
import { useToast } from '../../Components/Toast/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const VendorManagement = () => {
    const toast = useToast();
    const [vendors, setVendors] = useState([]);
    const [vendorStats, setVendorStats] = useState({ total: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSendReply = async () => {
        if (!replyMessage.trim() || !selectedTicket) return;
        setSending(true);
        try {
            await apiService.adminDirectMessage({
                vendorId: selectedTicket._id || selectedTicket.id,
                message: replyMessage,
                subject: "Direct Support Message from Admin"
            });
            toast.success("Message transmitted successfully");
            setShowReplyModal(false);
            setReplyMessage('');
        } catch (err) {
            console.error("Failed to send message:", err);
            toast.error("Transmission failed: " + (err.response?.data?.message || err.response?.data?.error || err.message));
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchVendors(), fetchStats()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchStats = async () => {
        try {
            const stats = await apiService.getAdminVendorStats();
            setVendorStats(stats);
        } catch (err) {
            console.error("Failed to fetch vendor stats", err);
        }
    };

    const fetchVendors = async () => {
        try {
            const data = await apiService.getAllVendors('all');
            setVendors(data.vendors || []);
        } catch (err) {
            console.error("Failed to fetch vendors:", err);
            setVendors([]);
        }
    };

    const filteredVendors = vendors.filter(v => {
        const matchesFilter = filter === 'all' || v.vendorStatus === filter;
        const matchesSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;

    });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'approved': return 'bg-green-50 text-green-600 border-green-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-[24px] bg-[#8b5cf6]/20 flex items-center justify-center animate-spin">
                    <Loader2 className="w-8 h-8 text-[#8b5cf6]" />
                </div>
                <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.4em]">Loading Vendors...</p>
            </div>
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
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Vendor Management</h2>
                    <p className="text-gray-500 font-medium text-xs">Manage registered vendors and their details</p>
                </div>

                <div className="relative group w-full md:w-96">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#d946ef]/20 to-[#8b5cf6]/20 rounded-[24px] blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="relative w-full bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[20px] px-5 py-3 pl-12 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all font-medium text-xs text-gray-900 placeholder-gray-400"
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
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Vendors</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{vendorStats.total || 0}</p>
                </div>

                <div className="bg-white/40 backdrop-blur-md p-6 rounded-[32px] border border-white/60 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Approval</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{vendorStats.pending || 0}</p>
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/60 bg-white/20">
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Name</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Email</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Joined Date</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Apps</th>

                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/60">
                            {filteredVendors.length > 0 ? (
                                filteredVendors.map((vendor) => (
                                    <tr key={vendor._id || vendor.id} className="hover:bg-white/40 transition-colors group">

                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] flex items-center justify-center text-white font-black shadow-lg">
                                                    {(vendor.name || 'A').charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-900 text-sm">{vendor.name || 'Anonymous'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getStatusColor(vendor.vendorStatus)}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${vendor.vendorStatus === 'approved' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                {vendor.vendorStatus || 'pending'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-xs font-medium text-gray-500">{vendor.email || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-xs font-medium text-gray-500">
                                                {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <span className="font-black text-gray-900 text-xs">{vendor.agents?.length || 0}</span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedTicket(vendor);
                                                    setShowReplyModal(true);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Message Vendor"
                                            >

                                                <MessageSquare size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-[2rem] bg-gray-50 border border-white flex items-center justify-center shadow-inner">
                                                <UserCheck className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 text-lg mb-1">No vendors found.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reply Modal */}
            <AnimatePresence>
                {showReplyModal && selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/80 backdrop-blur-2xl w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl border border-white/60"
                        >
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#8b5cf6]/10 rounded-xl text-[#8b5cf6]">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Direct Message</h2>
                                </div>
                                <button
                                    onClick={() => setShowReplyModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="bg-white/50 rounded-[24px] p-6 border border-gray-100">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">To Vendor</span>
                                            <p className="font-bold text-gray-900 text-lg mt-1">{selectedTicket.name || 'Anonymous'}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</span>
                                            <p className="font-bold text-gray-900 mt-1">{selectedTicket.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Response Message</label>
                                    <textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Type your official response here..."
                                        rows="6"
                                        className="w-full bg-white border border-gray-200 rounded-[24px] p-6 text-sm outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all resize-none font-medium placeholder-gray-400"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => setShowReplyModal(false)}
                                        className="px-8 py-4 bg-gray-100 text-gray-900 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendReply}
                                        disabled={sending}
                                        className="px-8 py-4 bg-[#8b5cf6] text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-[#7c3aed] transition-all flex items-center gap-2 shadow-lg shadow-[#8b5cf6]/25 disabled:opacity-50 hover:scale-105 active:scale-95"
                                    >
                                        {sending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Transmitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Transmit Response
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default VendorManagement;
