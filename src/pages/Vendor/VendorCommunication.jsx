import React, { useState, useEffect } from 'react';
import { Mail, Shield, MessageSquare, Bell, CheckCircle2, X, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';

const VendorCommunication = () => {
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactSubject, setContactSubject] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [adminMessages, setAdminMessages] = useState([]);

    // Get logged in user (Vendor)
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const vendorId = storedUser._id || storedUser.id;

    useEffect(() => {
        const fetchMessages = async () => {
            if (vendorId) {
                const response = await apiService.getVendorDashboardMessages(vendorId);
                if (response.success) {
                    // Map backend logs to UI format
                    const formatted = response.data.map(msg => ({
                        id: msg._id,
                        sender: 'Admin', // Always Admin for this view
                        subject: msg.subject,
                        status: msg.status === 'Unread' ? 'Unread' : 'Read',
                        date: new Date(msg.createdAt).toLocaleDateString()
                    }));
                    setAdminMessages(formatted);
                }
            }
        };
        fetchMessages();
    }, [vendorId]);

    // Mock Data for User Support
    const userEmails = [
        { id: 1, user: 'david@client.com', app: 'AI Content Writer', subject: 'Billing question for Pro plan', status: 'Open', date: '2 hours ago' },
        { id: 2, user: 'sarah@startup.io', app: 'Code Helper Pro', subject: 'Feature request: Python 3.12 support', status: 'Replied', date: '1 day ago' },
        { id: 3, user: 'mike@test.org', app: 'Code Helper Pro', subject: 'Login issues', status: 'Closed', date: '3 days ago' },
    ];

    const handleContactAdmin = async () => {
        try {
            await apiService.sendDashboardMessage({
                senderType: 'Vendor',
                senderId: vendorId,
                recipientType: 'Admin',
                // recipientId: null, // Admin ID not needed generally if single admin
                subject: contactSubject,
                message: contactMessage,
                senderName: storedUser.name || 'Vendor',
                senderEmail: storedUser.email
            });

            alert("Message sent successfully!");

        } catch (err) {
            console.error(err);
            alert("Error sending message: " + (err.response?.data?.error || err.message));
        }

        setShowContactModal(false);
        setContactSubject('');
        setContactMessage('');
    };

    return (
        <div className="space-y-12 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">Secure <span className="text-[#8b5cf6]">Comms.</span></h1>
                    <p className="text-gray-500 font-bold text-lg tracking-tight max-w-xl">Centralized hub for all incoming and outgoing transmissions.</p>
                </div>
            </div>

            {/* A) USER SUPPORT */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] overflow-hidden"
            >
                <div className="px-8 py-6 border-b border-white/60 bg-white/20 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <Mail size={20} />
                        </div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">User Transmission Log</h2>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/40 border-b border-white/60">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Origin Node</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Target App</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Subject Line</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {userEmails.map((email, index) => (
                                <motion.tr
                                    key={email.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (index * 0.05) }}
                                    className="hover:bg-white/60 transition-colors"
                                >
                                    <td className="px-8 py-5 font-bold text-gray-900">{email.user}</td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-500">{email.app}</td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-700">{email.subject}</td>
                                    <td className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">{email.date}</td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${email.status === 'Open' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            email.status === 'Replied' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                'bg-gray-100 text-gray-500 border border-gray-200'
                                            }`}>
                                            {email.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.section>

            {/* B) ADMIN SUPPORT */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] overflow-hidden"
            >
                <div className="px-8 py-6 border-b border-white/60 bg-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Admin Directives</h2>
                            <p className="text-xs font-bold text-gray-500 mt-0.5">admin@aimall.com</p>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded block mt-1 w-fit">
                                Node: {vendorId ? `${vendorId.substring(0, 6)}...` : 'Unknown'} | Logs: {adminMessages.length}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowContactModal(true)}
                        className="px-6 py-2 bg-[#8b5cf6] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#8b5cf6]/20 flex items-center gap-2"
                    >
                        <Mail size={14} /> Contact Admin
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/40 border-b border-white/60">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Source</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Directive Subject</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Received Date</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {adminMessages.map((msg, index) => (
                                <motion.tr
                                    key={msg.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (index * 0.05) }}
                                    className="hover:bg-white/60 transition-colors"
                                >
                                    <td className="px-8 py-5 font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#8b5cf6]"></div>
                                        {msg.sender}
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-700">{msg.subject}</td>
                                    <td className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">{msg.date}</td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${msg.status === 'Unread' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            }`}>
                                            {msg.status === 'Read' && <CheckCircle2 size={12} className="mr-1" />}
                                            {msg.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.section>

            {/* Contact Modal */}
            {showContactModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Contact Admin</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regarding:</span>
                                        <span className="bg-[#8b5cf6]/10 text-[#8b5cf6] px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest">
                                            Platform Issue
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setShowContactModal(false); setContactSubject(''); setContactMessage(''); }}
                                    className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={contactSubject}
                                        onChange={(e) => setContactSubject(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                        placeholder="Briefly describe your issue..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message</label>
                                    <textarea
                                        value={contactMessage}
                                        onChange={(e) => setContactMessage(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all resize-none h-32"
                                        placeholder="Type your message here..."
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleContactAdmin}
                                disabled={!contactSubject.trim() || !contactMessage.trim()}
                                className="w-full mt-8 py-4 bg-[#0F172A] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Send size={14} /> Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorCommunication;
