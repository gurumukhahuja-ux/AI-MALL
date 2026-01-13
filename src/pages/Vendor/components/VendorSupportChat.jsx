import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Loader2, MoreVertical, MessageSquare, Trash2, Plus, X, AlertCircle, Headset } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../../../services/apiService';

const VendorSupportChat = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isSignalModalOpen, setIsSignalModalOpen] = useState(false);
    const [signalData, setSignalData] = useState({ type: 'AdminSupport', priority: 'medium', description: '' });
    const [submittingSignal, setSubmittingSignal] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchReports = async () => {
        try {
            const data = await apiService.getMyReports();
            setReports(data || []);
            if (data && data.length > 0 && !selectedReport) {
                setSelectedReport(data[0]);
            }
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
            fetchReports();
        } catch (err) {
            alert("Failed to send response");
        }
    };

    const handleDeleteReport = async (e, reportId) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this support signal?")) return;

        try {
            await apiService.deleteReport(reportId);
            if (selectedReport?._id === reportId) {
                setSelectedReport(null);
                setMessages([]);
            }
            fetchReports();
        } catch (err) {
            alert("Failed to delete signal");
        }
    };

    const handleSignalSubmit = async (e) => {
        e.preventDefault();
        if (!signalData.description.trim()) return;

        setSubmittingSignal(true);
        try {
            const newReport = await apiService.submitReport(signalData);
            setSignalData({ type: 'AdminSupport', priority: 'medium', description: '' });
            setIsSignalModalOpen(false);
            await fetchReports();
            if (newReport && newReport._id) {
                // Find and select the new report
                const data = await apiService.getMyReports();
                const found = (data || []).find(r => r._id === newReport._id);
                if (found) setSelectedReport(found);
            }
        } catch (err) {
            alert("Failed to submit signal");
        } finally {
            setSubmittingSignal(false);
        }
    };

    const filteredReports = reports;

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#8b5cf6]" />
            <p className="text-xs font-black text-[#8b5cf6] uppercase tracking-widest">Initializing Chat...</p>
        </div>
    );

    return (
        <div className="flex gap-6 h-[calc(100vh-180px)] w-full max-w-[1600px] mx-auto p-4">
            {/* Left Card: Messages List */}
            <div className="w-[340px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white flex flex-col overflow-hidden shrink-0">
                <div className="p-6 pb-2 shrink-0 space-y-4">
                    <div
                        className="w-full py-3 bg-[#8b5cf6] text-white rounded-full font-black text-[12px] uppercase tracking-widest text-center shadow-[0_10px_20px_rgba(139,92,246,0.2)] cursor-default"
                    >
                        Chat History
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-1 no-scrollbar">
                    {filteredReports.map(report => (
                        <div
                            key={report._id}
                            onClick={() => setSelectedReport(report)}
                            className={`p-5 rounded-[24px] cursor-pointer transition-all relative group ${selectedReport?._id === report._id
                                ? 'bg-white shadow-[0_10px_25px_rgba(139,92,246,0.06)] border border-gray-50'
                                : 'bg-transparent hover:bg-gray-50/50'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-bold tracking-tight text-[14px] line-clamp-1 pr-12 ${selectedReport?._id === report._id ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {report.description || 'New Signal'}
                                </h4>
                                <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">{new Date(report.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <p className="text-[12px] font-medium text-gray-400 line-clamp-1">
                                {report.lastMessage || (report.type === 'bug' ? 'Bug Report' : 'General Inquiry')}
                            </p>

                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDeleteReport(e, report._id)}
                                className="absolute right-4 bottom-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {filteredReports.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 opacity-20">
                            <MessageSquare className="w-8 h-8 mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No signals</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Card: Chat Window */}
            <div className="flex-1 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white flex flex-col overflow-hidden relative">
                {selectedReport ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 px-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#8b5cf6]">
                                        <Headset size={20} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-[15px] font-black text-gray-900 tracking-tight leading-none uppercase">
                                        Admin Support
                                    </h3>
                                </div>
                            </div>
                            <button className="text-gray-300 hover:text-gray-600 transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-10 pt-6 space-y-6 no-scrollbar scroll-smooth">
                            <div className="flex flex-col items-start w-full">
                                <div className="max-w-[70%] bg-[#f8fafc] text-gray-600 px-6 py-3 rounded-[18px] rounded-tl-none font-medium text-[14px]">
                                    {selectedReport.description}
                                </div>
                                <span className="text-[9px] font-bold text-gray-300 mt-2 px-1">
                                    {new Date(selectedReport.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={msg._id}
                                    className={`flex flex-col ${msg.senderRole === 'vendor' ? 'items-end' : 'items-start'} w-full`}
                                >
                                    <div className={`max-w-[70%] px-6 py-3 rounded-[18px] font-medium text-[14px] ${msg.senderRole === 'vendor'
                                        ? 'bg-[#8b5cf6] text-white rounded-tr-none'
                                        : 'bg-[#f8fafc] text-gray-600 rounded-tl-none'}`}>
                                        {msg.message}
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-300 mt-2 px-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </motion.div>
                            ))}
                            {loadingMessages && (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-300" />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-8 pt-2 flex items-center gap-4">
                            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-4">
                                <input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Reply to admin..."
                                    className="flex-1 bg-[#f8fafc] border border-gray-100 rounded-full px-8 py-5 text-[14px] font-medium text-gray-900 focus:outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="w-14 h-14 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white disabled:opacity-30 flex items-center justify-center transition-all shrink-0 shadow-sm"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-30">
                        <MessageSquare className="w-12 h-12 mb-4" />
                        <h2 className="text-xl font-black text-gray-900">Select a message</h2>
                    </div>
                )}
            </div>
            {/* New Signal Modal */}
            {isSignalModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-[500px] bg-white rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white overflow-hidden"
                    >
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Plus size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">New Signal</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrative Support</p>
                                </div>
                            </div>
                            <button onClick={() => setIsSignalModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSignalSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Matter Description</label>
                                <textarea
                                    required
                                    value={signalData.description}
                                    onChange={(e) => setSignalData({ ...signalData, description: e.target.value })}
                                    className="w-full bg-[#f8fafc] border border-gray-100 rounded-2xl p-4 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all min-h-[140px] resize-none"
                                    placeholder="Explain your situation to the neural admin layer..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Priority Rank</label>
                                    <select
                                        value={signalData.priority}
                                        onChange={(e) => setSignalData({ ...signalData, priority: e.target.value })}
                                        className="w-full bg-[#f8fafc] border border-gray-100 rounded-2xl px-4 py-3 text-[13px] font-bold text-gray-700 focus:outline-none transition-all"
                                    >
                                        <option value="low">LOW</option>
                                        <option value="medium">MEDIUM</option>
                                        <option value="high">HIGH</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Matter Category</label>
                                    <select
                                        value={signalData.type}
                                        onChange={(e) => setSignalData({ ...signalData, type: e.target.value })}
                                        className="w-full bg-[#f8fafc] border border-gray-100 rounded-2xl px-4 py-3 text-[13px] font-bold text-gray-700 focus:outline-none transition-all"
                                    >
                                        <option value="AdminSupport">GENERAL</option>
                                        <option value="bug">SYSTEM ERROR</option>
                                        <option value="account">SECURITY</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submittingSignal || !signalData.description.trim()}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all shadow-xl shadow-gray-900/10"
                                >
                                    {submittingSignal ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Transmit Signal'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default VendorSupportChat;
