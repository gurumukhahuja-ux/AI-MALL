import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Search,
    RefreshCw,
    MessageSquare,
    Eye,
    Shield,
    X
} from 'lucide-react';
import { useRecoilState } from 'recoil';
import { userData } from '../../userStore/userData'; // Corrected path
import apiService from '../../services/apiService'; // Corrected path

const AdminSupport = () => {
    const [currentUserData] = useRecoilState(userData);
    const user = currentUserData?.user || { role: 'user' };

    // State
    const [activeChat, setActiveChat] = useState(null);
    const [chatsList, setChatsList] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [permissionError, setPermissionError] = useState(false);

    const messagesEndRef = useRef(null);

    // Initial Fetch & Polling
    useEffect(() => {
        let interval;

        const fetchData = async () => {
            await fetchAdminChats();
        };

        fetchData();
        interval = setInterval(fetchData, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeChat]);

    // --- API CALLS ---

    const fetchAdminChats = async () => {
        try {
            const data = await apiService.getAdminActiveChats();
            setChatsList(Array.isArray(data) ? data : []);
            setPermissionError(false);

            // If we have an active chat selected, update its specific messages from the list
            if (activeChat) {
                const updatedChat = data.find(c => c._id === activeChat._id);
                if (updatedChat) {
                    setMessages(updatedChat.messages || []);
                }
            }
        } catch (err) {
            console.error("Fetch Admin Chats Error:", err);
            if (err.response?.status === 403) {
                setPermissionError(true);
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const text = newMessage;
        setNewMessage(""); // Optimistic clear

        try {
            if (!activeChat) return;
            await apiService.sendSupportChatMessage(activeChat._id, text);
            await fetchAdminChats(); // Refresh immediately
            setActiveChat(null); // Close the reply modal
        } catch (err) {
            console.error("Failed to send", err);
            alert("Failed to send message. Please try again.");
        }
    };

    // Filter chats for admin
    const filteredChats = chatsList.filter(c =>
        c.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- RENDER ---

    if (permissionError) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center p-8 bg-white/60 backdrop-blur-3xl rounded-[40px] border border-white/60 shadow-2xl text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-500 animate-pulse">
                    <Shield size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Access Permissions Update Required</h2>
                <p className="text-slate-500 max-w-md mb-8 font-medium">
                    Your account capabilities have changed. Please refresh your secure session to access the Admin Console.
                </p>
                <button
                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 shadow-xl"
                >
                    Update Session (Log Out)
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 h-full w-full relative overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-[#1E293B]">User Support</h2>
                    <p className="text-subtext text-sm">Manage user inquiries and support tickets</p>
                </div>
            </div>

            {/* Content Table */}
            <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-0">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users or tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Preview</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredChats.map((chat) => {
                                const lastMsg = chat.messages?.[chat.messages.length - 1];
                                return (
                                    <tr key={chat._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                                                    {chat.userId?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{chat.userId?.name || 'Unknown User'}</p>
                                                    <p className="text-xs text-slate-400 font-medium">{chat.userId?.email || 'No Email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-purple-100">
                                                UserSupport
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-medium text-slate-600 max-w-[300px] truncate">
                                                {lastMsg?.text || 'No messages'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-slate-500">
                                                {lastMsg ? new Date(lastMsg.timestamp).toLocaleDateString('en-US') : '-'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider w-fit border border-amber-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                Open
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => { setActiveChat(chat); setMessages(chat.messages || []); }}
                                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all active:scale-95"
                                            >
                                                <MessageSquare size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredChats.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-20">
                                        <div className="flex flex-col items-center opacity-40">
                                            <MessageSquare size={48} className="text-slate-300 mb-4" />
                                            <p className="font-black text-slate-400 uppercase tracking-widest">No Active Tickets</p>
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
                {activeChat && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/50"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <MessageSquare size={20} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Reply to User</h2>
                                </div>
                                <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="grid grid-cols-2 gap-8 mb-6">
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User</p>
                                            <p className="font-bold text-slate-900 truncate">{activeChat.userId?.name}</p>
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                                            <p className="font-bold text-slate-900 break-all">{activeChat.userId?.email}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Latest Inquiry</p>
                                        <p className="font-medium text-slate-700 leading-relaxed">
                                            {activeChat.messages?.[activeChat.messages?.length - 1]?.text || "No message content"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Response Message</p>
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your official response here..."
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={() => setActiveChat(null)}
                                        className="px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendMessage}
                                        className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        <Send size={16} />
                                        Send
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

export default AdminSupport;
