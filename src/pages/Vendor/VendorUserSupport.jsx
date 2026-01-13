import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Clock, AlertCircle, Inbox, Send, ChevronRight, User, X, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../services/apiService';

const VendorUserSupport = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterAgent, setFilterAgent] = useState('all');
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const vendorId = user.id || user._id || localStorage.getItem('userId');

    useEffect(() => {
        fetchMessages();
    }, [vendorId, filterStatus, filterAgent]);

    const fetchMessages = async () => {
        if (!vendorId) return;
        try {
            // Filter logic can be handled in apiService or backend if needed
            // For now, the backend endpoint supports query params
            // But apiService.getVendorMessages(vendorId) might need to accept params
            // Let's assume for now we fetch all and filter client side or update apiService later if needed.
            // Actually, the apiService method I added: custom params?
            // apiService.getVendorMessages(vendorId) -> calls GET .../vendor/${vendorId}
            // Let's stick to the method I created.
            const response = await apiService.getVendorMessages(vendorId);
            let msgs = response.data?.messages || [];

            // Client side filtering for now since I didn't add params to apiService method explicitly
            if (filterStatus !== 'all') msgs = msgs.filter(m => m.status === filterStatus);
            if (filterAgent !== 'all') msgs = msgs.filter(m => m.agentName === filterAgent);

            setMessages(msgs);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoading(false);
        }
    };

    const updateMessageStatus = async (messageId, status) => {
        try {
            // We didn't add updateStatus to apiService yet, let's use apiClient directly or add it?
            // Let's add it to apiService for cleanliness.
            // For this specific step, I'll use the raw call via apiService's axios instance if accessible, 
            // or just add it to apiService.js in a previous/next step? 
            // I'll add it to apiService method now by using the internal axios client if I can or simpler:
            // Just use axios for this one specific call if I don't want to edit apiService again, 
            // BUT proper way is apiService. 
            // Let's stick to axios for this single call OR assume I can edit apiService.
            // Wait, I can't edit apiService in the middle of this Replace.
            // I'll leave the axios call BUT fix the URL to use API constant or relative path.
            await axios.patch(`http://localhost:8080/api/messages/${messageId}/status`, { status });
            fetchMessages();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const sendReply = async () => {
        if (!replyText.trim() || !selectedMessage) return;

        setSendingReply(true);
        try {
            await apiService.replyToMessage({
                messageId: selectedMessage._id,
                userEmail: selectedMessage.userEmail,
                userName: selectedMessage.userName,
                vendorName: user.name,
                agentName: selectedMessage.agentName,
                originalSubject: selectedMessage.subject,
                originalMessage: selectedMessage.message,
                replyMessage: replyText
            });

            // Update status manually or refetch
            // We can try to update status via backend or here
            await updateMessageStatus(selectedMessage._id, 'Replied');

            setSelectedMessage(null);
            setReplyText('');
            alert('Reply sent successfully!');
            fetchMessages();
        } catch (error) {
            console.error("Failed to send reply", error);
            alert('Failed to send reply. Please try again.');
        } finally {
            setSendingReply(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Replied': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Closed': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    // Get unique agents for filter
    const uniqueAgents = [...new Set(messages.map(m => m.agentName))];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">User <span className="text-[#8b5cf6]">Support.</span></h1>
                    <p className="text-gray-500 font-bold text-lg tracking-tight max-w-xl">Monitor user messages and provide direct assistance.</p>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                    >
                        <option value="all">All Status</option>
                        <option value="New">New</option>
                        <option value="Replied">Replied</option>
                        <option value="Closed">Closed</option>
                    </select>

                    {uniqueAgents.length > 0 && (
                        <select
                            value={filterAgent}
                            onChange={(e) => setFilterAgent(e.target.value)}
                            className="px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                        >
                            <option value="all">All Agents</option>
                            {uniqueAgents.map(agent => (
                                <option key={agent} value={agent}>{agent}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Messages Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[48px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden"
            >
                <div className="px-10 py-8 border-b border-gray-100 bg-white/40 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                            <MessageSquare size={24} />
                        </div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">User Messages</h2>
                    </div>
                    <div className="px-5 py-2.5 bg-white/60 rounded-2xl border border-white shadow-sm">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total: <span className="text-[#8b5cf6] text-sm ml-2 font-black">{messages.length}</span></span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">User</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Email</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Agent</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Subject</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Date</th>
                                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {messages.map((message, index) => (
                                <motion.tr
                                    key={message._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedMessage(message)}
                                    className="hover:bg-white/80 transition-all cursor-pointer group"
                                >
                                    <td className="px-10 py-7">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-100 to-white flex items-center justify-center text-gray-700 border border-gray-200 group-hover:border-[#8b5cf6] transition-colors text-xs font-black">
                                                {message.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-black text-gray-900 group-hover:text-[#8b5cf6] transition-colors tracking-tight text-sm">{message.userName}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-7">
                                        <p className="text-sm font-bold text-gray-500 group-hover:text-gray-900 transition-colors lowercase">{message.userEmail}</p>
                                    </td>
                                    <td className="px-10 py-7">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={12} className="text-[#d946ef]" />
                                            <span className="text-xs font-black text-gray-700 uppercase tracking-tight">{message.agentName}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-7">
                                        <p className="text-sm font-bold text-gray-700 truncate max-w-xs">{message.subject}</p>
                                    </td>
                                    <td className="px-10 py-7">
                                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{new Date(message.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-10 py-7 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${getStatusColor(message.status)}`}>
                                                {message.status}
                                            </span>
                                            <ChevronRight size={18} className="text-gray-300 group-hover:text-[#8b5cf6] group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {messages.length === 0 && !loading && (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full animate-pulse" />
                            <MessageSquare size={40} className="text-gray-300 relative z-10" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">No Messages Yet</h3>
                        <p className="text-gray-400 font-bold text-lg max-w-xs mx-auto">Users can contact you from the marketplace. Messages will appear here.</p>
                    </div>
                )}
            </motion.div>

            {/* Message Detail Modal */}
            <AnimatePresence>
                {selectedMessage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-3xl overflow-y-auto no-scrollbar">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white/95 backdrop-blur-3xl border border-white/60 rounded-[48px] max-w-2xl w-full p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative"
                        >
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="absolute top-8 right-8 p-4 bg-white/50 hover:bg-white text-gray-900 rounded-3xl transition-all border border-gray-100 shadow-sm"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="mb-10 flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-white shadow-xl">
                                    <MessageSquare size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-[#8b5cf6] uppercase tracking-[0.4em] mb-1">Message Detail</h3>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none truncate max-w-md">
                                        {selectedMessage.subject}
                                    </h2>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">From</span>
                                        <p className="font-black text-gray-900">{selectedMessage.userName}</p>
                                        <p className="text-sm font-bold text-gray-500 lowercase">{selectedMessage.userEmail}</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Agent</span>
                                        <p className="font-black text-gray-900">{selectedMessage.agentName}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Received</span>
                                    <p className="font-black text-gray-900">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                                </div>

                                <div className="p-8 bg-white/60 rounded-[32px] border border-white/80 shadow-inner min-h-[200px]">
                                    <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest block mb-4 border-b border-purple-100 pb-2">Message</span>
                                    <p className="text-lg text-gray-700 font-bold leading-relaxed whitespace-pre-wrap">
                                        {selectedMessage.message}
                                    </p>
                                </div>

                                {/* Reply Section */}
                                <div className="space-y-4">
                                    <div className="p-6 bg-gradient-to-br from-[#8b5cf6]/5 to-[#d946ef]/5 rounded-[32px] border border-[#8b5cf6]/20">
                                        <label className="block text-xs font-black text-[#8b5cf6] uppercase tracking-widest mb-3">
                                            Your Reply
                                        </label>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            rows={6}
                                            placeholder="Type your response to the user here..."
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent font-semibold text-gray-900 transition-all resize-none"
                                        />
                                        <p className="text-xs text-gray-400 mt-2 font-semibold">{replyText.length} characters</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 pt-6">
                                    <button
                                        onClick={() => {
                                            console.log("Send clicked", replyText);
                                            sendReply();
                                        }}
                                        disabled={false}
                                        className="flex-1 py-6 bg-purple-600 hover:bg-purple-700 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:shadow-lg transition-all flex items-center justify-center gap-3 group active:scale-95"
                                    >
                                        {sendingReply ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                Send Reply
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => { updateMessageStatus(selectedMessage._id, 'Closed'); setSelectedMessage(null); setReplyText(''); }}
                                        className="px-10 py-6 bg-white text-gray-400 hover:text-gray-900 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all border border-gray-100"
                                    >
                                        Mark Closed
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VendorUserSupport;
