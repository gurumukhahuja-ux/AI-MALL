import React, { useEffect, useState } from 'react';

import { Plus, Settings, Trash2, Bot, Code, Edit3, Save, FileText, Download, Star, Play, Sparkles, Activity, ShieldCheck, Zap, ChevronRight, MessageCircle, X, Send } from 'lucide-react';
import { apiService } from '../services/apiService';
import axios from 'axios';
import { apis, AppRoute } from '../types';
import { getUserData } from '../userStore/userData';
import { useNavigate, Link } from 'react-router';
import AgentModal from '../Components/AgentModal/AgentModal';
import { motion, AnimatePresence } from 'framer-motion';

const MyAgents = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [editedInstructions, setEditedInstructions] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Modal State
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const user = getUserData("user")
    const [notifications, setNotifications] = useState([]);

    // Fetch notifications to check for unread vendor replies
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const notifs = await apiService.getNotifications();
                setNotifications(notifs);
            } catch (e) {
                console.error(e);
            }
        };
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(n =>
        !n.isRead &&
        n.role === 'user' &&
        n.message.startsWith('New Message:')
    ).length;

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        setLoading(true);
        const userId = user?.id || user?._id;
        try {
            const res = await axios.post(apis.getUserAgents, { userId });
            setAgents(res.data.agents);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAgent = async () => {
        const newAgent = {
            name: 'New Agent',
            description: 'A new custom assistant.',
            type: 'general',
            instructions: 'You are a helpful assistant.'
        };
        await apiService.createAgent(newAgent);
        loadAgents();
    };

    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [contactData, setContactData] = useState({ subject: '', message: '' });
    const [contactLoading, setContactLoading] = useState(false);

    // Inbox State
    const [inboxOpen, setInboxOpen] = useState(false);
    const [viewingMessage, setViewingMessage] = useState(null);

    const handleInboxClick = () => {
        setInboxOpen(true);
    };

    const handleViewMessage = async (notif) => {
        if (!notif.targetId) return;
        try {
            const res = await apiService.getMessageById(notif.targetId);
            if (res.success) {
                setViewingMessage(res.data);
                // Mark as read logic
                try {
                    await axios.put(`${apis.notifications}/read/${notif._id}`, {}, {
                        headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    // Update local list
                    setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                } catch (e) { console.error(e) }
            }
        } catch (e) {
            console.error(e);
            alert("Could not load message.");
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to remove this agent from your fleet?')) {
            await apiService.unsubscribeAgent(id);
            loadAgents();
        }
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactLoading(true);
        try {
            await apiService.contactVendor({
                agentId: selectedAgent._id,
                userName: user.name,
                userEmail: user.email,
                subject: contactData.subject,
                message: contactData.message,
                userId: user.id || user._id
            });
            alert('Your message has been sent to the vendor successfully.');
            setContactModalOpen(false);
            setContactData({ subject: '', message: '' });
        } catch (error) {
            alert('Failed to send message. Please try again.');
        } finally {
            setContactLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 no-scrollbar bg-transparent relative">
            {/* Decorative Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#8b5cf6]/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-[#d946ef]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 md:gap-10 mb-10 md:mb-20 relative z-10">
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">
                        My <span className="text-[#8b5cf6]">Agents.</span>
                    </h1>
                    <p className="text-gray-400 font-bold text-lg md:text-xl tracking-tight max-w-xl opacity-70">
                        Manage your collection of AI agents.
                    </p>
                </div>

                <div className="flex items-center gap-3 md:gap-6 flex-wrap">
                    {/* Notification Badge */}
                    <button
                        onClick={handleInboxClick}
                        className="relative px-4 py-3 md:px-6 md:py-4 bg-white/40 border border-white/60 rounded-[20px] flex items-center gap-3 hover:bg-white hover:scale-105 transition-all shadow-sm group"
                    >
                        <div className="relative">
                            <MessageCircle size={20} className={`text-[#8b5cf6] ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Inbox</p>
                            <p className="text-xs font-black text-gray-900 leading-none">{unreadCount > 0 ? `${unreadCount} New Replies` : 'Check History'}</p>
                        </div>
                    </button>
                    {agents.length > 0 && (
                        <button
                            onClick={async () => {
                                if (window.confirm("Strictly remove ALL agents from your fleet? This cannot be undone.")) {
                                    await apiService.clearFleet();
                                    loadAgents();
                                }
                            }}
                            className="px-4 py-3 md:px-8 md:py-6 bg-red-50 text-red-500 font-black rounded-[24px] md:rounded-[32px] shadow-sm transition-all hover:bg-red-500 hover:text-white hover:scale-105 active:scale-95 uppercase text-[10px] md:text-xs tracking-[0.3em] flex items-center gap-2 md:gap-4"
                        >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden md:inline">Reset Fleet</span>
                            <span className="md:hidden">Reset</span>
                        </button>
                    )}

                </div>
            </header>

            {/* Content Section */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-[6px] border-[#8b5cf6]/10 border-t-[#8b5cf6] animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-[#8b5cf6] animate-pulse" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.5em] animate-pulse">Syncing Core Registry...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 relative z-10">
                    <AnimatePresence mode="popLayout">
                        {/* Agents Grid */}
                        {agents.map((agent, index) => (
                            <motion.div
                                key={agent._id}
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -15 }}
                                className="bg-white/40 backdrop-blur-3xl border border-white/80 rounded-[40px] md:rounded-[56px] p-6 md:p-10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(139,92,246,0.15)] transition-all duration-700 group relative overflow-hidden flex flex-col h-full border-b-4 border-b-white/50"
                            >
                                {/* Decorative Glow */}
                                <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#8b5cf6]/5 rounded-full blur-[100px] group-hover:bg-[#8b5cf6]/10 transition-all duration-1000"></div>

                                <div className="flex justify-between items-start mb-6 md:mb-10 relative z-10">
                                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-[24px] md:rounded-[32px] p-1.5 flex items-center justify-center shadow-2xl border border-gray-50 group-hover:scale-110 transition-all duration-700 overflow-hidden">
                                        <img
                                            src={agent.avatar || `https://ui-avatars.com/api/?name=${agent.agentName}&background=8b5cf6&color=fff`}
                                            className="w-full h-full object-cover rounded-[18px] md:rounded-[24px]"
                                            alt={agent.agentName}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleDelete(agent._id, e)}
                                            className="p-2 mb-auto rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                                            title="Remove from Fleet"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase">STABLE_LINK</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 relative z-10 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">{agent.agentName}</h3>
                                        <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-tighter border border-[#8b5cf6]/20 px-1.5 rounded-md">TM</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.3em] opacity-80">
                                        <Activity size={10} />
                                        {agent.category || 'General Intel'}
                                    </div>
                                    <p className="text-lg text-gray-500 font-bold leading-relaxed mb-10 h-24 line-clamp-3 opacity-70 group-hover:opacity-100 transition-opacity">
                                        {agent.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-10 relative z-10 gap-6 pt-6 border-t border-white/40">
                                    <button
                                        onClick={() => {
                                            const targetUrl = (!agent?.url || agent.url.trim() === "") ? AppRoute.agentSoon : agent.url;
                                            setSelectedAgent({ ...agent, url: targetUrl });
                                            setIsModalOpen(true);
                                        }}
                                        className="flex-1 py-6 bg-gray-900 text-white rounded-[28px] font-black text-[11px] shadow-2xl hover:bg-[#8b5cf6] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 uppercase tracking-[0.2em] group/launch"
                                    >
                                        <Play size={18} fill="currentColor" className="group-hover/launch:scale-110 transition-transform" />
                                        Initialize Link
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAgent(agent);
                                            setContactModalOpen(true);
                                        }}
                                        className="w-16 h-16 rounded-[24px] bg-white/60 border border-white text-gray-400 hover:text-[#8b5cf6] hover:bg-white transition-all shadow-sm flex items-center justify-center group/btn relative"
                                        title="Contact Vendor"
                                    >
                                        <MessageCircle size={22} className="group-hover/btn:scale-110 transition-transform" />
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => navigate(AppRoute.INVOICES)}
                                        className="w-16 h-16 rounded-[24px] bg-white/60 border border-white text-gray-400 hover:text-[#8b5cf6] hover:bg-white transition-all shadow-sm flex items-center justify-center group/btn"
                                        title="View Registry Log"
                                    >
                                        <FileText size={22} className="group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <AgentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                agent={selectedAgent}
            />

            {/* Contact Vendor Modal */}
            <AnimatePresence>
                {contactModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setContactModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl relative z-10 border border-white/50 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#8b5cf6] to-[#d946ef]" />
                            <button
                                onClick={() => setContactModalOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Contact Vendor</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                    <span>Regarding:</span>
                                    <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md font-bold text-xs uppercase tracking-wider">
                                        {selectedAgent?.agentName}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleContactSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={contactData.subject}
                                        onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] transition-all"
                                        placeholder="Briefly describe your issue..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={contactData.message}
                                        onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] transition-all resize-none"
                                        placeholder="Type your message here..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={contactLoading}
                                    className="w-full py-4 bg-gray-900 text-white rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-[#8b5cf6] transition-all shadow-lg hover:shadow-purple-500/25 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {contactLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Inbox Modal */}
            <AnimatePresence>
                {inboxOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setInboxOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white/90 backdrop-blur-xl border border-white rounded-[40px] p-0 w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden h-[600px] flex flex-col"
                        >
                            {/* Inbox Header */}
                            <div className="p-8 pb-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">Inbox</h3>
                                    <p className="text-sm font-bold text-gray-400">Vendor Replies & Updates</p>
                                </div>
                                <button
                                    onClick={() => setInboxOpen(false)}
                                    className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Inbox Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {(() => {
                                    // Strictly filter for vendor replies only
                                    const messages = notifications.filter(n =>
                                        n.message.startsWith('New Message:')
                                    );

                                    if (messages.length === 0) {
                                        return (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <MessageCircle size={32} className="opacity-20" />
                                                </div>
                                                <p className="font-bold">No replies found</p>
                                            </div>
                                        );
                                    }

                                    return messages.map(notif => (
                                        <div
                                            key={notif._id}
                                            onClick={() => handleViewMessage(notif)}
                                            className={`p-6 rounded-[24px] border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group ${!notif.isRead ? 'bg-white border-[#8b5cf6]/20 shadow-lg shadow-purple-500/5' : 'bg-gray-50 border-transparent opacity-70 hover:opacity-100'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />}
                                                    <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest">Vendor Reply</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="font-bold text-gray-800 line-clamp-2 group-hover:text-[#8b5cf6] transition-colors">
                                                {notif.message}
                                            </p>
                                        </div>
                                    ));
                                })()}
                            </div>

                            {/* Detail View Overlay */}
                            <AnimatePresence>
                                {viewingMessage && (
                                    <motion.div
                                        initial={{ x: '100%' }}
                                        animate={{ x: 0 }}
                                        exit={{ x: '100%' }}
                                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                        className="absolute inset-0 bg-white z-20 flex flex-col"
                                    >
                                        <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
                                            <button
                                                onClick={() => setViewingMessage(null)}
                                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                            >
                                                <ChevronRight size={24} className="rotate-180 text-gray-600" />
                                            </button>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 leading-none">{viewingMessage.subject}</h3>
                                                <p className="text-xs font-bold text-gray-400 mt-1">From: {viewingMessage.vendorEmail}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest">Vendor Response</span>
                                                <div className="p-6 bg-[#8b5cf6]/5 rounded-3xl border border-[#8b5cf6]/10 text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
                                                    {viewingMessage.replyMessage || "Check your email for the full content."}
                                                </div>
                                                {viewingMessage.repliedAt && (
                                                    <p className="text-[10px] font-bold text-gray-400 text-right">
                                                        Sent {new Date(viewingMessage.repliedAt).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="pt-8 border-t border-gray-100 space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Original Message</span>
                                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {viewingMessage.message}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyAgents;
