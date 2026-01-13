import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Clock, ShieldAlert, BadgeInfo, BadgeCheck, Sparkles, X, Activity, Zap } from 'lucide-react';
import axios from 'axios';
import { apis } from '../types';
import { getUserData, notificationState } from '../userStore/userData';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecoilState } from 'recoil';

const Notifications = () => {
    const [notifications, setNotifications] = useRecoilState(notificationState);
    const [loading, setLoading] = useState(true);
    const [appIcons, setAppIcons] = useState({});
    const token = getUserData()?.token;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(apis.notifications, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    timeout: 5000
                });
                setNotifications(res.data);
            } catch (err) {
                console.error('Error fetching notifications:', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchNotifications();
        }
    }, [token]);

    useEffect(() => {
        const fetchAppIcons = async () => {
            const uniqueTargetIds = [...new Set(notifications.filter(n => n.targetId).map(n => n.targetId))];
            const icons = {};

            for (const targetId of uniqueTargetIds) {
                try {
                    const res = await axios.get(`${apis.agents}/${targetId}`);
                    if (res.data && res.data.avatar) {
                        icons[targetId] = res.data.avatar;
                    }
                } catch (err) {
                    console.error(`Failed to fetch icon for ${targetId}:`, err);
                }
            }
            setAppIcons(icons);
        };

        if (notifications.length > 0) {
            fetchAppIcons();
        }
    }, [notifications]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`${apis.notifications}/read/${id}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`${apis.notifications}/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'ALERT': return <ShieldAlert className="w-7 h-7 text-red-500" />;
            case 'SUCCESS': return <BadgeCheck className="w-7 h-7 text-emerald-500" />;
            default: return <BadgeInfo className="w-7 h-7 text-[#8b5cf6]" />;
        }
    };

    const filteredNotifications = notifications
        .filter(notif => {
            const isVendorNotification =
                notif.message.includes('Congratulations!') ||
                notif.message.includes('approved') ||
                notif.message.includes('rejected') ||
                notif.message.includes('good work');
            return !isVendorNotification;
        });

    const [expandedId, setExpandedId] = useState(null);

    return (
        <div className="p-4 md:p-8 lg:p-12 h-screen overflow-y-auto no-scrollbar bg-transparent relative">
            {/* Decorative Background Glows */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#8b5cf6]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-5xl mx-auto relative z-10"
            >
                <div className="mb-10 md:mb-16">
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter mb-4 md:mb-6 leading-none">Notifications<span className="text-[#8b5cf6]">.</span></h1>
                    <p className="text-gray-500 font-bold text-lg md:text-xl tracking-tight max-w-2xl opacity-70">Stay updated with your latest alerts.</p>
                </div>

                <div className="grid gap-6 md:gap-8">
                    <AnimatePresence mode='popLayout'>
                        {filteredNotifications.length === 0 && !loading && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/40 backdrop-blur-3xl p-10 md:p-24 rounded-[48px] md:rounded-[64px] border border-white/60 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent" />
                                <div className="w-24 h-24 rounded-[36px] bg-white flex items-center justify-center text-[#8b5cf6] mx-auto mb-10 shadow-2xl border border-white/60 relative z-10">
                                    <Bell className="w-10 h-10 opacity-30 animate-pulse" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-4 relative z-10 uppercase">Null Void Sequence</h3>
                                <p className="text-gray-500 font-bold text-base md:text-lg max-w-sm mx-auto relative z-10 leading-relaxed">No neural transmissions detected. Your ecosystem is currently reaching peak stability.</p>
                            </motion.div>
                        )}

                        {filteredNotifications.map((notif, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                                key={notif._id}
                                onClick={() => setExpandedId(expandedId === notif._id ? null : notif._id)}
                                className={`bg-white/40 backdrop-blur-3xl p-6 md:p-10 rounded-[40px] md:rounded-[56px] border transition-all flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_-20px_rgba(139,92,246,0.15)] group relative overflow-hidden cursor-pointer ${!notif.isRead ? 'border-[#8b5cf6]/40 ring-1 ring-[#8b5cf6]/10' : 'border-white/60'
                                    } ${expandedId === notif._id ? 'md:ring-2 md:ring-[#8b5cf6]/20 shadow-2xl' : ''}`}
                            >
                                {!notif.isRead && (
                                    <div className="absolute top-0 left-0 w-2 h-full bg-[#8b5cf6]" />
                                )}

                                <div className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-[24px] md:rounded-[32px] flex items-center justify-center shadow-2xl border border-white transition-all duration-700 group-hover:rotate-6 ${notif.type === 'ALERT' ? 'bg-red-50' :
                                    notif.type === 'SUCCESS' ? 'bg-emerald-50' : 'bg-white'
                                    }`}>
                                    {appIcons[notif.targetId] ? (
                                        <img src={appIcons[notif.targetId]} alt="App" className="w-10 h-10 md:w-12 md:h-12 rounded-[16px] md:rounded-[20px] object-cover shadow-sm" />
                                    ) : (
                                        getIcon(notif.type)
                                    )}
                                </div>

                                <div className="flex-1 space-y-4 w-full">
                                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                                        <div className="space-y-1 text-center md:text-left">
                                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                                <h3 className={`text-xl md:text-2xl font-black tracking-tight uppercase ${!notif.isRead ? 'text-gray-900 font-black' : 'text-gray-500 font-bold'}`}>
                                                    {notif.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/60 px-5 py-2 rounded-2xl border border-white/80 shadow-sm">
                                            <Clock className="w-4 h-4 text-[#8b5cf6]" />
                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                                                {new Date(notif.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>

                                    <p className={`text-base md:text-lg font-bold leading-relaxed max-w-3xl text-center md:text-left transition-all duration-500 ${!notif.isRead ? 'text-gray-600' : 'text-gray-400'} ${expandedId === notif._id ? '' : 'line-clamp-1 md:line-clamp-2'}`}>
                                        {notif.message}
                                    </p>

                                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 pt-4">
                                        {!notif.isRead && (
                                            <button
                                                onClick={() => markAsRead(notif._id)}
                                                className="w-full md:w-auto text-[11px] font-black text-[#8b5cf6] flex items-center justify-center gap-3 uppercase tracking-[0.2em] hover:bg-[#8b5cf6] hover:text-white px-6 py-3 rounded-2xl transition-all shadow-sm border border-[#8b5cf6]/20 bg-white"
                                            >
                                                <BadgeCheck className="w-4 h-4" /> Mark as Read
                                            </button>
                                        )}

                                        <button
                                            onClick={() => deleteNotification(notif._id)}
                                            className="w-full md:w-auto text-[11px] font-black text-red-500 flex items-center justify-center gap-3 uppercase tracking-[0.2em] px-6 py-3 rounded-2xl transition-all relative group/btn overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-red-500 opacity-0 group-hover/btn:opacity-10 transition-opacity" />
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>

                                        <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden md:flex">
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {loading && (
                        <div className="flex flex-col items-center justify-center p-20 gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-4 border-[#8b5cf6]/10 border-t-[#8b5cf6] animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap size={24} className="text-[#8b5cf6] animate-pulse" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.4em] animate-pulse">Syncing Nexus Data...</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Notifications;
