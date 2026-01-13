import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, User, Send, Clock, Shield, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/apiService';

const SupportChat = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchReports = async () => {
        try {
            const data = await apiService.getReports();
            setReports(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (reportId) => {
        setLoadingMessages(true);
        try {
            const data = await apiService.getReportMessages(reportId);
            setMessages(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMessages(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        if (selectedReport) {
            fetchMessages(selectedReport._id);
        }
    }, [selectedReport]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !selectedReport) return;

        try {
            const sentMsg = await apiService.sendReportMessage(selectedReport._id, newMessage);
            setMessages(prev => [...prev, sentMsg]);
            setNewMessage('');
            fetchReports(); // Refresh sidebar to show latest message preview
        } catch (err) {
            alert("Failed to send message");
        }
    };

    const filteredReports = reports.filter(r => {
        const matchesFilter = filter === 'all' ? true :
            filter === 'open' ? ['open', 'in-progress'].includes(r.status) :
                ['resolved', 'closed'].includes(r.status);
        const matchesSearch = (r.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#8b5cf6]" />
            <p className="text-xs font-black text-[#8b5cf6] uppercase tracking-widest">Initializing Protocol...</p>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100">
            {/* Sidebar */}
            <div className="w-[400px] border-r border-gray-100 flex flex-col bg-white">
                <div className="p-8 pb-4">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-8 italic">Messages<span className="text-[#8b5cf6]">.</span></h2>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#f8fafc] border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/5 transition-all placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                    {filteredReports.map(report => (
                        <div
                            key={report._id}
                            onClick={() => setSelectedReport(report)}
                            className={`p-6 rounded-[28px] cursor-pointer transition-all ${selectedReport?._id === report._id
                                ? 'bg-white shadow-[0_15px_30px_rgba(0,0,0,0.05)] border border-gray-100 ring-4 ring-[#8b5cf6]/5'
                                : 'bg-transparent hover:bg-gray-50'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-black tracking-tight text-[15px] ${selectedReport?._id === report._id ? 'text-[#8b5cf6]' : 'text-gray-900'}`}>
                                    {report.userId?.name || 'Anonymous Node'}
                                </h4>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(report.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <p className="text-xs font-bold text-gray-400 line-clamp-1 italic uppercase tracking-tight">
                                {report.description}
                            </p>
                        </div>
                    ))}
                    {filteredReports.length === 0 && (
                        <div className="py-20 text-center opacity-20">
                            <Shield className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Directory Clear</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedReport ? (
                    <>
                        {/* Header */}
                        <div className="h-28 px-10 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-purple-500/20">
                                    {(selectedReport.userId?.name || '?')[0]}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter leading-none mb-1.5 uppercase italic">
                                        {selectedReport.userId?.name || 'Unknown'}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.2em]">
                                            {selectedReport.userId?.email || 'OFFLINE'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="p-3 rounded-xl text-gray-300 hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/5 transition-all">
                                    <AlertCircle size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar scroll-smooth">
                            {/* Origin Signal */}
                            <div className="flex flex-col items-start w-full">
                                <div className="max-w-[75%] bg-[#f8fafc] text-gray-800 px-8 py-5 rounded-[32px] rounded-tl-none font-bold text-[15px] border border-gray-50 leading-relaxed shadow-sm">
                                    {selectedReport.description}
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3 px-2">
                                    {new Date(selectedReport.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ORIGIN
                                </span>
                            </div>

                            {/* Thread */}
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={msg._id}
                                    className={`flex flex-col ${msg.senderRole === 'admin' ? 'items-end' : 'items-start'} w-full`}
                                >
                                    <div className={`max-w-[75%] px-8 py-5 rounded-[32px] font-bold text-[15px] shadow-lg leading-relaxed ${msg.senderRole === 'admin'
                                        ? 'bg-[#8b5cf6] text-white rounded-tr-none shadow-purple-500/10'
                                        : 'bg-[#f8fafc] text-gray-800 border border-gray-50 rounded-tl-none shadow-sm'}`}>
                                        {msg.message}
                                    </div>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3 px-2">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {msg.senderRole === 'admin' ? 'CENTRAL' : 'RESPONSE'}
                                    </span>
                                </motion.div>
                            ))}
                            {loadingMessages && (
                                <div className="flex justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-purple-400 opacity-50" />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-10 pt-2 border-t border-gray-50">
                            <div className="max-w-5xl mx-auto flex items-center gap-4 relative group">
                                <input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your transmission..."
                                    className="flex-1 h-20 bg-[#f8fafc] border border-gray-100 rounded-[32px] px-10 text-[15px] font-bold text-gray-900 focus:outline-none focus:ring-8 focus:ring-[#8b5cf6]/5 transition-all shadow-inner placeholder-gray-300"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="w-16 h-16 rounded-full bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-2xl shadow-purple-500/30 disabled:opacity-30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                >
                                    <Send size={22} className="ml-1" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
                        <div className="w-32 h-32 bg-gray-50 rounded-[40px] flex items-center justify-center mb-10 border border-gray-100 rotate-6 shadow-inner">
                            <MessageSquare className="w-12 h-12 text-gray-200" />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">Neutral Link Idle<span className="text-[#8b5cf6]">.</span></h2>
                        <p className="text-gray-400 font-bold text-lg max-w-sm leading-relaxed opacity-60">Initialize communication protocol by selecting an active transmission node.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportChat;
