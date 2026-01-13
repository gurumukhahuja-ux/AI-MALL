import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, CheckCircle, AlertCircle, X, Menu, Cpu, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { apis } from '../../types';

const Topbar = ({ toggleSidebar, vendorName, vendorType, vendorAvatar }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const notificationRef = useRef(null);
    const profileRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(apis.notifications, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (Array.isArray(res.data)) {
                setNotifications(res.data);
                const unread = res.data.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            // Optimistic update
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await axios.put(`${apis.notifications}/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    return (
        <header className="h-24 bg-transparent flex items-center justify-between px-8 z-30">
            {/* Left: Mobile Menu & Search */}
            <div className="flex items-center flex-1 max-w-xl gap-6">
                <button
                    onClick={toggleSidebar}
                    className="p-3 bg-white/40 backdrop-blur-md rounded-[16px] text-gray-900 border border-white hover:bg-white hover:text-[#8b5cf6] md:hidden transition-all shadow-sm"
                >
                    <Menu size={20} />
                </button>

                <div className="flex-1 relative group max-w-lg hidden sm:block">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search autonomous agents..."
                        className="w-full bg-white/40 backdrop-blur-md border border-white/60 rounded-[20px] py-4 pl-14 pr-6 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 focus:bg-white/60 shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Right: Health, Notifications, Profile */}
            <div className="flex items-center gap-4 sm:gap-6">

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative w-12 h-12 flex items-center justify-center rounded-[20px] bg-white/40 backdrop-blur-md border border-white/60 text-gray-500 hover:text-[#8b5cf6] hover:bg-white transition-all shadow-sm group ${showNotifications ? 'bg-white text-[#8b5cf6] shadow-md' : ''}`}
                    >
                        <Bell size={20} className={showNotifications ? 'fill-current' : ''} />
                        {unreadCount > 0 && (
                            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#d946ef] rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-4 w-96 bg-white/60 backdrop-blur-3xl rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="absolute inset-0 bg-gradient-to-b from-white to-white/50 -z-10" />
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50">
                                <div className="flex items-center gap-2">
                                    <Bell size={16} className="text-[#8b5cf6] fill-[#8b5cf6]" />
                                    <h3 className="font-black text-gray-900 uppercase tracking-wide text-xs">System Alerts</h3>
                                </div>
                                <button
                                    onClick={() => setShowNotifications(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                                {notifications.length === 0 ? (
                                    <div className="p-10 text-center flex flex-col items-center justify-center text-gray-400 gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                                            <Bell className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-wider">No new signals</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification._id}
                                                className={`p-4 rounded-[20px] hover:bg-white transition-all flex gap-4 cursor-pointer group border border-transparent hover:border-white hover:shadow-lg ${!notification.isRead ? 'bg-[#f0f9ff]/50' : ''}`}
                                                onClick={() => !notification.isRead && markAsRead(notification._id)}
                                            >
                                                <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                                    notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                                        'bg-[#f3e8ff] text-[#8b5cf6]'
                                                    }`}>
                                                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                                                        notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                                                            <Bell className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm leading-relaxed ${!notification.isRead ? 'font-black text-gray-900' : 'font-medium text-gray-500'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2 block">
                                                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • System Log
                                                    </span>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 rounded-full bg-[#8b5cf6] mt-3 flex-shrink-0 animate-pulse" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile - Dropdown on Click */}
                <div className="relative pl-6 ml-2 border-l border-gray-200/50" ref={profileRef}>
                    <button
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className={`flex items-center gap-4 p-1.5 pr-4 rounded-[20px] transition-all border group bg-white/20 backdrop-blur-sm ${showProfileDropdown ? 'bg-white border-white shadow-md' : 'hover:bg-white/40 border-transparent hover:border-white/60 hover:shadow-sm'}`}
                    >
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#8b5cf6] font-black border border-white/60 shadow-lg group-hover:scale-105 transition-transform overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#f3e8ff] to-[#e0e7ff] opacity-50" />
                            {vendorAvatar ? (
                                <img src={vendorAvatar} alt="Profile" className="w-full h-full object-cover relative z-10" />
                            ) : (
                                vendorName ? <span className="relative z-10 text-lg">{vendorName.charAt(0).toUpperCase()}</span> : <User size={20} className="relative z-10" />
                            )}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-black text-gray-900 leading-none group-hover:text-[#8b5cf6] transition-colors">{vendorName || 'Vendor Portal'}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Cpu size={10} className="text-[#8b5cf6]" />
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{vendorType || 'Partner'}</p>
                            </div>
                        </div>
                    </button>

                    {/* Profile Dropdown */}
                    {showProfileDropdown && (
                        <div className="absolute right-0 top-full mt-4 w-56 bg-white/80 backdrop-blur-3xl rounded-[24px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="p-2">
                                <button
                                    onClick={() => { navigate('/vendor/settings'); setShowProfileDropdown(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[18px] text-gray-500 hover:bg-white hover:text-[#8b5cf6] transition-all group text-left"
                                >
                                    <SettingsIcon size={18} className="group-hover:rotate-45 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                                </button>
                                <div className="h-px bg-gray-100 my-1 mx-2" />
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('user');
                                        localStorage.removeItem('token');
                                        localStorage.removeItem('vendorId');
                                        navigate('/vendor-login');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[18px] text-red-500 hover:bg-red-50 transition-all group text-left"
                                >
                                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Logout Portal</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
