import React, { useState, useEffect } from 'react';
import { Search, Loader2, Clock, CheckCircle, AlertCircle, User, Mail, Send, X, Globe, UserCheck, MessageSquare } from 'lucide-react';
import apiService from '../../services/apiService';
import { useToast } from '../../Components/Toast/ToastContext';
import { motion } from 'framer-motion';

const VendorManagement = () => {
    const toast = useToast();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        // Mock data logic for demonstration if API fails or is empty, 
        // replace with actual API call if backend is fully ready with data.
        fetchVendorTickets();
    }, []);

    const fetchVendorTickets = async () => {
        try {
            setLoading(true);
            const reports = await apiService.getReports();
            setTickets(Array.isArray(reports) ? reports : []);
        } catch (err) {
            console.error("Failed to fetch vendor tickets:", err);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            await apiService.resolveReport(id, 'resolved', 'Issue resolved by admin');
            toast.success("Ticket resolved successfully");
            fetchVendorTickets();
        } catch (err) {
            console.error(err);
            toast.error("Failed to resolve ticket");
        }
    };

    const handleReplyClick = (ticket) => {
        setSelectedTicket(ticket);
        setReplyMessage('');
        setShowReplyModal(true);
    };

    const handleSendReply = async () => {
        if (!replyMessage.trim()) {
            toast.error("Please enter a message");
            return;
        }

        try {
            setSending(true);
            await apiService.replyToVendorTicket(selectedTicket._id, replyMessage);
            toast.success("Reply sent successfully via email!");
            setShowReplyModal(false);
            setReplyMessage('');
            fetchVendorTickets();
        } catch (err) {
            toast.error("Failed to send reply: " + (err.response?.data?.error || err.message));
        } finally {
            setSending(false);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const isVendorSupport = ticket.type === 'AdminSupport';
        const matchesFilter = filter === 'all' || ticket.status === filter;
        const matchesSearch = ticket.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return isVendorSupport && matchesFilter && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'in-progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'resolved': return 'bg-green-50 text-green-600 border-green-100';
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
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Vendors</h2>
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

            <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/60 bg-white/20">
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Vendor</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Message Preview</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/60">
                            {filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket) => (
                                    <tr key={ticket._id}
                                        onClick={() => handleReplyClick(ticket)}
                                        className="hover:bg-white/40 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] flex items-center justify-center text-white font-black shadow-lg">
                                                    {(ticket.userId?.name || 'A').charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-sm">{ticket.userId?.name || 'Anonymous'}</span>
                                                    <span className="text-[10px] text-gray-400">{ticket.userId?.email || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${ticket.type === 'AdminSupport' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {ticket.type || 'Support'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <p className="text-xs font-medium text-gray-500 line-clamp-1 max-w-xs">{ticket.description}</p>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-xs font-medium text-gray-500">{new Date(ticket.timestamp || ticket.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getStatusColor(ticket.status)}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'resolved' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                {ticket.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-[#8b5cf6] hover:border-[#8b5cf6]/20 transition-all shadow-sm">
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
                                                <p className="font-black text-gray-900 text-lg mb-1">No users found.</p>
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
            {showReplyModal && selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 backdrop-blur-2xl w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl border border-white/60"
                    >
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#8b5cf6]/10 rounded-xl text-[#8b5cf6]">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Reply to Vendor</h2>
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
                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vendor</span>
                                        <p className="font-bold text-gray-900 text-lg mt-1">{selectedTicket.userId?.name || 'Anonymous'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</span>
                                        <p className="font-bold text-gray-900 mt-1">{selectedTicket.userId?.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inquiry</span>
                                    <p className="mt-2 text-gray-600 leading-relaxed">{selectedTicket.description}</p>
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
        </motion.div>
    );
};

export default VendorManagement;
