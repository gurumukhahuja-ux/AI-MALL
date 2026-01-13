import React, { useState, useEffect } from 'react';
import { ShieldAlert, Calendar, CheckCircle2, MessageSquare, ChevronRight, Bell, Shield, Plus, X, Send, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/apiService';

const VendorAdminSupport = () => {
    const [adminMessages, setAdminMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ type: 'other', priority: 'medium', description: '' });

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const data = await apiService.getMyReports();
            setAdminMessages(data || []);
        } catch (error) {
            console.error("Failed to fetch admin messages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiService.submitReport({
                ...formData,
                type: 'AdminSupport', // Overriding type for admin support
                subject: `Support Request from ${user.name}`
            });
            await fetchMessages();
            setShowForm(false);
            setFormData({ type: 'other', priority: 'medium', description: '' });
        } catch (err) {
            alert('Failed to submit support request');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-50 text-blue-600 border border-blue-100';
            case 'in-progress': return 'bg-amber-50 text-amber-600 border border-amber-100';
            case 'resolved': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            default: return 'bg-gray-100 text-gray-500 border border-gray-200';
        }
    };

    return (
        <div className="space-y-8 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">Admin <span className="text-[#8b5cf6]">Direct.</span></h1>
                    <p className="text-gray-500 font-bold text-lg tracking-tight max-w-xl">Updates and directives from central command.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-4 rounded-[20px] shadow-lg shadow-[#8b5cf6]/30 transition-all group scale-100 hover:scale-105 active:scale-95"
                >
                    <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                        <Plus size={18} className="text-white" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Signal Command</span>
                </button>
            </div>

            {/* Admin Messages Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] overflow-hidden"
            >
                <div className="px-8 py-6 border-b border-white/60 bg-white/20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-[#8b5cf6]/30">
                            <Bell size={20} />
                        </div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Command Log</h2>
                    </div>
                    <div className="px-4 py-2 bg-white/50 rounded-xl border border-white/60 shadow-sm">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Logs: <span className="text-[#8b5cf6] text-sm ml-1">{adminMessages.length}</span></span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/40 border-b border-white/60">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">ID</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Submitted Date</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {adminMessages.map((msg, index) => (
                                <motion.tr
                                    key={msg._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-white/60 transition-colors cursor-pointer group"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] border border-[#8b5cf6]/20">
                                                <Shield size={14} />
                                            </div>
                                            <span className="font-bold text-gray-900 group-hover:text-[#8b5cf6] transition-colors">{msg._id.substring(0, 8)}...</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-700 max-w-md truncate">{msg.description}</td>
                                    <td className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">{new Date(msg.timestamp).toLocaleDateString()}</td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(msg.status)}`}>
                                            {msg.status === 'resolved' && <CheckCircle2 size={12} className="mr-1" />}
                                            {msg.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {adminMessages.length === 0 && !loading && (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ShieldAlert size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">All Systems Nominal</h3>
                        <p className="text-gray-400 font-medium">No active directives or alerts from Admin.</p>
                    </div>
                )}
                {loading && (
                    <div className="p-16 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
                    </div>
                )}
            </motion.div>

            {/* How Support Works Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#8b5cf6]/5 to-indigo-600/5 rounded-[32px] border border-[#8b5cf6]/20 p-8 relative overflow-hidden"
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                    <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl text-[#8b5cf6] shadow-sm border border-[#8b5cf6]/20">
                        <ShieldAlert size={32} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight flex items-center gap-2">
                            Admin Protocol <span className="text-[#8b5cf6] text-xs uppercase tracking-widest border border-[#8b5cf6]/30 px-2 py-0.5 rounded-full">Info</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/60 p-5 rounded-2xl border border-white/60 shadow-sm">
                                <span className="text-xs font-black text-[#8b5cf6] uppercase tracking-widest mb-2 block">Step 01</span>
                                <p className="text-sm font-bold text-gray-800 mb-1">Initiate Signal</p>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    Use the "Signal Command" button to open a direct channel to admins.
                                </p>
                            </div>
                            <div className="bg-white/60 p-5 rounded-2xl border border-white/60 shadow-sm">
                                <span className="text-xs font-black text-[#8b5cf6] uppercase tracking-widest mb-2 block">Step 02</span>
                                <p className="text-sm font-bold text-gray-800 mb-1">Priority Processing</p>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    Operator inquiries are flagged for immediate review by central command.
                                </p>
                            </div>
                            <div className="bg-white/60 p-5 rounded-2xl border border-white/60 shadow-sm">
                                <span className="text-xs font-black text-[#8b5cf6] uppercase tracking-widest mb-2 block">Step 03</span>
                                <p className="text-sm font-bold text-gray-800 mb-1">Secure Response</p>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    Command replies are encrypted and sent to your registered email node.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Modal for Signal Command */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-3xl overflow-y-auto no-scrollbar">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white/95 backdrop-blur-3xl border border-white/60 rounded-[48px] max-w-xl w-full p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative"
                        >
                            <button
                                onClick={() => setShowForm(false)}
                                className="absolute top-8 right-8 p-4 bg-white/50 hover:bg-white text-gray-900 rounded-3xl transition-all border border-gray-100 shadow-sm"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="mb-10 flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-white shadow-xl">
                                    <ShieldAlert size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-[#8b5cf6] uppercase tracking-[0.4em] mb-1">Signal Command</h3>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">New Ticket</h2>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Priority</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 font-semibold text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-all"
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Type</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 font-semibold text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-all"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="other">General Inquiry</option>
                                            <option value="bug">Technical Issue</option>
                                            <option value="security">Security</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Description</label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 font-semibold text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6] transition-all resize-none"
                                        placeholder="Describe your issue or inquiry for admin..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 py-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-3xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] py-5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#8b5cf6]/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        Initialize Ticket
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VendorAdminSupport;
