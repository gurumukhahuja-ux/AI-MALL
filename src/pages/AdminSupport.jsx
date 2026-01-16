import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    User,
    Clock,
    Search,
    RefreshCw,
    MessageSquare,
    MoreVertical,
    Check,
    Eye,
    Shield,
    Activity,
    Users,
    ShoppingBag,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Settings,
    UserCheck,
    LogOut,
    Command,
    ChevronDown,
    LayoutDashboard,
    X
} from 'lucide-react';
import { useRecoilState } from 'recoil';
import { userData } from '../userStore/userData';
import apiService from '../services/apiService';

const AdminSupport = () => {
    const navigate = useNavigate();
    const [currentUserData] = useRecoilState(userData);
    const user = currentUserData?.user || { role: 'user' };
    const realIsAdmin = user.role === 'admin' || user.role === 'Admin';

    // Toggle for Admins to view the interface as a User (for testing)
    const [simulateUser, setSimulateUser] = useState(false);

    // Effective role for the UI
    const isAdminView = realIsAdmin && !simulateUser;

    // State
    const [activeChat, setActiveChat] = useState(null);
    const [chatsList, setChatsList] = useState([]); // For Admin sidebar
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [permissionError, setPermissionError] = useState(false);

    const messagesEndRef = useRef(null);

    // Initial Fetch & Polling
    useEffect(() => {
        let interval;

        const fetchData = async () => {
            if (isAdminView) {
                await fetchAdminChats();
            } else {
                await fetchMyChat();
            }
        };

        fetchData();
        interval = setInterval(fetchData, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, [isAdminView]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeChat]);

    // --- API CALLS ---

    const fetchMyChat = async () => {
        // Don't show global loading for polling updates
        if (messages.length === 0) setChatLoading(true);
        try {
            const chat = await apiService.getMySupportChat();
            if (chat) {
                setChatsList([chat]); // List view
                setMessages(chat.messages || []);

                // Keep activeChat in sync if open
                if (activeChat) {
                    setActiveChat(chat);
                }
            }
        } catch (err) {
            console.error("Fetch User Chat Error:", err);
        } finally {
            setChatLoading(false);
        }
    };

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
            if (isAdminView) {
                if (!activeChat) return;
                await apiService.sendSupportChatMessage(activeChat._id, text);
                await fetchAdminChats(); // Refresh immediately
                setActiveChat(null); // Close the reply modal
                // Optional: You could show a specialized toast here instead of alert
            } else {
                // User sending message
                // Check if activeChat exists (it should if fetchMyChat worked, or needs creation)
                // The /my-chat endpoint creates it if missing, but we need the ID.
                let chatId = activeChat?._id;
                if (!chatId) {
                    const chat = await apiService.getMySupportChat();
                    chatId = chat._id;
                    setActiveChat(chat);
                }
                await apiService.sendSupportChatMessage(chatId, text);
                await fetchMyChat(); // Refresh immediately
            }
        } catch (err) {
            console.error("Failed to send", err);
            alert("Failed to send message. Please try again.");
        }
    };

    // Filter chats for admin
    const [supportTypeTab, setSupportTypeTab] = useState('user'); // 'user' or 'vendor'

    const filteredChats = chatsList.filter(c => {
        const matchesTab = supportTypeTab === 'user' ? (c.chatType === 'user_support' || !c.chatType) : (c.chatType === 'vendor_support');
        const matchesSearch = c.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // --- RENDER ---

    // 1. ACCESS DENIED STATE (Admin View Only)
    if (isAdminView && permissionError) {
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

    // 2. USER VIEW (Simulated or Real)
    if (!isAdminView) {
        // Using chatsList from state

        return (
            <div className="flex-1 h-full w-full relative overflow-hidden bg-[#f8fafc]/50 p-8 flex flex-col">
                {/* Simulation Banner */}
                {realIsAdmin && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-900 text-white px-6 py-2 rounded-b-xl text-xs font-black uppercase tracking-widest shadow-lg z-50 flex items-center gap-3">
                        <span>🧪 User View Simulation</span>
                        <button
                            onClick={() => setSimulateUser(false)}
                            className="bg-white/20 hover:bg-white/40 px-3 py-1 rounded-lg transition-colors"
                        >
                            Exit
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">My Support Tickets</h1>
                        <p className="text-slate-500 font-medium">Track and manage your support requests</p>
                    </div>

                    {chatsList.length === 0 && (
                        <button
                            onClick={async () => {
                                const chat = await apiService.getMySupportChat();
                                if (chat) {
                                    setChatsList([chat]);
                                    setActiveChat(chat);
                                    setMessages(chat.messages || []);
                                }
                            }}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
                        >
                            <MessageSquare size={18} />
                            New Ticket
                        </button>
                    )}
                </div>

                {/* Content - Responsive View */}
                <div className="flex-1 bg-white md:rounded-[32px] md:shadow-sm md:border border-slate-100 overflow-hidden flex flex-col">
                    {/* Desktop Table View */}
                    <div className="hidden md:block flex-1 overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Message</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {chatsList.map((chat) => {
                                    const lastMsg = chat.messages?.[chat.messages.length - 1];
                                    return (
                                        <tr key={chat._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                                    <Shield size={20} />
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="font-bold text-slate-900 text-sm">General Inquiry</span>
                                                <p className="text-xs text-slate-400">ID: {chat._id.substring(0, 8)}...</p>
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
                                                    Active
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
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden flex-1 overflow-y-auto divide-y divide-slate-100 p-4">
                        {chatsList.map((chat) => {
                            const lastMsg = chat.messages?.[chat.messages.length - 1];
                            return (
                                <div
                                    key={chat._id}
                                    className="p-4 bg-white rounded-2xl mb-4 border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
                                    onClick={() => { setActiveChat(chat); setMessages(chat.messages || []); }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">General Inquiry</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {chat._id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[8px] font-black uppercase tracking-wider border border-amber-100">
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                        {lastMsg?.text || 'No messages yet...'}
                                    </p>
                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>{lastMsg ? new Date(lastMsg.timestamp).toLocaleDateString() : '-'}</span>
                                        <span className="text-indigo-600 flex items-center gap-1">Open Chat <MessageSquare size={12} /></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {chatsList.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40">
                            <MessageSquare size={48} className="text-slate-300 mb-4" />
                            <p className="font-black text-slate-400 uppercase tracking-widest">No Support Tickets</p>
                        </div>
                    )}
                </div>

                {/* User Chat Modal - Using activeChat as trigger, but we need to manage it. */}
                {/* I will add a 'viewChat' param to this component in next step. For now, let's render it if activeChat exists. */}
                <AnimatePresence>
                    {activeChat && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white md:rounded-[32px] shadow-2xl w-full max-w-4xl h-full md:h-[80vh] overflow-hidden border border-white/50 flex flex-col"
                            >
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Support Chat</h2>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Online</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveChat(null)}
                                        className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Chat Interface Reuse */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.senderId === (user.id || user._id);
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-4 rounded-3xl relative group ${isMe
                                                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/20'
                                                    : 'bg-white text-slate-800 border border-white shadow-sm rounded-tl-none'
                                                    }`}>
                                                    <p className="font-medium text-sm leading-relaxed">{msg.text}</p>
                                                    <div className={`text-[10px] uppercase tracking-widest mt-1 flex items-center justify-end gap-1 ${isMe ? 'opacity-70 text-blue-100' : 'opacity-40 text-slate-500'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-4 bg-white border-t border-slate-100">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all disabled:opacity-50 hover:scale-105 shadow-lg shadow-blue-500/20"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    const navigation = {
        management: [
            { id: "overview", label: "Control Center", icon: Activity },
            { id: "agents", label: "App Registry", icon: ShoppingBag },
            { id: "finance", label: "Economy Hub", icon: DollarSign },
            { id: "complaints", label: "Neural Support", icon: AlertTriangle, active: true },
            { id: "users", label: "User Identities", icon: Users },
            { id: "vendors", label: "Vendor Nodes", icon: UserCheck },
        ],
        governance: [
            { id: "approvals", label: "Nexus Approvals", icon: CheckCircle },
            { id: "roles", label: "Access Security", icon: Shield },
            { id: "settings", label: "Core Protocol", icon: Settings },
        ]
    };

    // 3. ADMIN VIEW (Table + Modal)
    return (
        <div className="flex-1 h-full w-full relative overflow-hidden bg-[#f8fafc]/50 p-8 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">User Support</h1>
                    <p className="text-slate-500 font-medium">Manage user inquiries and support tickets</p>
                </div>

                {/* Dev Toggle */}
                <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-[20px] border border-white/60 shadow-sm self-end">
                    <button
                        onClick={() => setSupportTypeTab('user')}
                        className={`px-6 py-2 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${supportTypeTab === 'user' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        User Support
                    </button>
                    <button
                        onClick={() => setSupportTypeTab('vendor')}
                        className={`px-6 py-2 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${supportTypeTab === 'vendor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Vendor Support
                    </button>
                </div>

                <button
                    onClick={() => setSimulateUser(true)}
                    className="bg-white hover:bg-slate-50 text-slate-500 hover:text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-slate-200 transition-all flex items-center gap-2"
                >
                    <Eye size={12} />
                    Test as User
                </button>
            </div>

            {/* Content - Responsive View */}
            <div className="flex-1 bg-white md:rounded-[32px] md:shadow-sm md:border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                    <div className="relative w-full md:w-96">
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

                {/* Desktop Table View */}
                <div className="hidden md:block flex-1 overflow-y-auto">
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
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden flex-1 overflow-y-auto divide-y divide-slate-100 p-4">
                    {filteredChats.map((chat) => {
                        const lastMsg = chat.messages?.[chat.messages.length - 1];
                        return (
                            <div
                                key={chat._id}
                                className="p-4 bg-white rounded-2xl mb-4 border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
                                onClick={() => { setActiveChat(chat); setMessages(chat.messages || []); }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                                            {chat.userId?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{chat.userId?.name || 'Unknown'}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{chat.userId?.email || 'No Email'}</p>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[8px] font-black uppercase tracking-wider border border-amber-100">
                                        Open
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                    {lastMsg?.text || 'No messages...'}
                                </p>
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>{lastMsg ? new Date(lastMsg.timestamp).toLocaleDateString() : '-'}</span>
                                    <span className="text-indigo-600 flex items-center gap-1 font-black">REPLY <Send size={12} /></span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredChats.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40">
                        <MessageSquare size={48} className="text-slate-300 mb-4" />
                        <p className="font-black text-slate-400 uppercase tracking-widest">No Active Tickets</p>
                    </div>
                )}
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
