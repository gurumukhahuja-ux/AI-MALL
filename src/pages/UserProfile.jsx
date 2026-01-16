import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, Settings, Infinity, Globe, Sun, DollarSign, Bell, Lock, LogOut, Trash2, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useRecoilState } from 'recoil';
import { userData } from '../userStore/userData';
import apiService from '../services/apiService';

const UserProfile = () => {
    const navigate = useNavigate();
    const [currentUserData, setCurrentUserData] = useRecoilState(userData);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        stats: { credits: 'Infinity', intelligenceLevel: 'Level 42', securityStatus: 'Shielded' },
        settings: {
            country: 'India (English)',
            theme: 'light',
            timezone: 'India (GMT+5:30)',
            currency: 'INR (₹)'
        },
        notifications: { email: true, push: false }
    });

    // Edit State
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState('');

    const user = currentUserData?.user || {};

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleSignOut = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiService.getUserProfile();
                if (data) {
                    setCurrentUserData(prev => ({ ...prev, user: data }));
                    if (data.profile) {
                        setProfile(prev => ({
                            ...prev,
                            stats: { ...prev.stats, ...data.profile.stats },
                            settings: { ...prev.settings, ...data.profile.settings },
                            notifications: { ...prev.notifications, ...data.profile.notifications }
                        }));
                    }
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [setCurrentUserData]);

    // Dark Mode Effect
    useEffect(() => {
        if (profile.settings.theme === 'dark' || (profile.settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [profile.settings.theme]);

    const handleNotificationToggle = async (type) => {
        const newValue = !profile.notifications[type];
        const updatedNotifications = { ...profile.notifications, [type]: newValue };
        setProfile(prev => ({ ...prev, notifications: updatedNotifications }));
        try {
            await apiService.updateUserProfile({ notifications: updatedNotifications });
        } catch (error) {
            console.error("Failed to update notifications:", error);
        }
    };

    const openEdit = (field, value) => {
        setEditingField(field);
        setTempValue(value);
    };

    const saveEdit = async () => {
        if (!editingField) return;
        const updatedSettings = { ...profile.settings, [editingField]: tempValue };

        setProfile(prev => ({ ...prev, settings: updatedSettings }));
        setEditingField(null);

        try {
            await apiService.updateUserProfile({ settings: updatedSettings });
        } catch (error) {
            console.error("Failed to save setting:", error);
        }
    };

    const totalSessions = user.chatSessions ? user.chatSessions.length : 0;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 px-4 py-8 md:p-8 transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-[24px] flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg shadow-teal-100 dark:shadow-teal-900/20">
                        {user.avatar && user.avatar !== '/User.jpeg' ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-[24px]" />
                        ) : (getInitials(user.name))}
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">{user.name || 'User'}</h1>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="text-sm font-semibold text-slate-400 dark:text-slate-300">{user.email || 'user@example.com'}</span>
                            <span className="bg-teal-50 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Free Plan</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Responsive Column Count */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-widest">Sessions</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{totalSessions}</p>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 bg-cyan-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors">
                            <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-widest">Plan</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">Pro</p>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 bg-purple-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors">
                            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-widest">Settings</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">Active</p>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors">
                            <Infinity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-widest">Credits</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{profile.stats.credits}</p>
                    </div>
                </div>

                {/* Settings Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 space-y-5 transition-colors">
                    <div onClick={() => openEdit('country', profile.settings.country)} className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl p-2 -mx-2">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <div>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Country/Region & Language</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{profile.settings.country}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    </div>

                    <div onClick={() => openEdit('theme', profile.settings.theme)} className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl p-2 -mx-2">
                        <div className="flex items-center gap-3">
                            <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <div>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Display Theme</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-200 capitalize">{profile.settings.theme}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    </div>

                    <div onClick={() => openEdit('timezone', profile.settings.timezone)} className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl p-2 -mx-2">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <div>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Timezone</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{profile.settings.timezone}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    </div>

                    <div onClick={() => openEdit('currency', profile.settings.currency)} className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-xl p-2 -mx-2">
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <div>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Currency</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{profile.settings.currency}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    </div>
                </div>

                {/* Notifications Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 transition-colors">
                    <div className="flex items-center gap-2 mb-6">
                        <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">Notifications</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">Email Notifications</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Receive updates</p>
                            </div>
                            <button
                                onClick={() => handleNotificationToggle('email')}
                                className={`w-11 h-6 rounded-full transition-all relative ${profile.notifications.email ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${profile.notifications.email ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">Push Notifications</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Receive updates</p>
                            </div>
                            <button
                                onClick={() => handleNotificationToggle('push')}
                                className={`w-11 h-6 rounded-full transition-all relative ${profile.notifications.push ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${profile.notifications.push ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Password Card */}
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 p-6 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <div>
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Password</p>
                                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Change Password</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                    <button onClick={handleSignOut} className="w-full bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-200 dark:shadow-none">
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                    <button className="w-full bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Edit Modal Overlay */}
            {editingField && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-black capitalize text-slate-900 dark:text-white">Edit {editingField}</h3>
                            <button onClick={() => setEditingField(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        {editingField === 'theme' ? (
                            <select
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full border-b-2 border-slate-100 dark:border-slate-800 py-2 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 mb-8 bg-transparent"
                                autoFocus
                            >
                                <option value="light" className="dark:bg-slate-900">Light</option>
                                <option value="dark" className="dark:bg-slate-900">Dark</option>
                                <option value="system" className="dark:bg-slate-900">System</option>
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="w-full border-b-2 border-slate-100 dark:border-slate-800 py-2 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 mb-8 placeholder-slate-300 bg-transparent"
                                autoFocus
                                placeholder={`Enter ${editingField}...`}
                            />
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditingField(null)}
                                className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
