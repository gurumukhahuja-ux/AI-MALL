import React, { useState, useEffect } from 'react';
import { AlertCircle, Server, ShieldAlert, Settings, Activity, Lock, User, Camera, Mail, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import { useToast } from '../../Components/Toast/ToastContext';

const PlatformSettings = () => {
    const toast = useToast();
    const [platformSettings, setPlatformSettings] = useState({
        allowPublicSignup: true,
        maintenanceMode: false,
        globalKillSwitch: false,
        globalRateLimit: 50
    });
    const [maintenance, setMaintenance] = useState(false);
    const [killSwitch, setKillSwitch] = useState(false);
    const [reqLimit, setReqLimit] = useState(50);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        avatar: ''
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setProfile({
            name: user.name || 'Admin User',
            email: user.email || 'admin@aimall.com',
            avatar: user.avatar || ''
        });
        fetchPlatformSettings();
    }, []);

    const fetchPlatformSettings = async () => {
        try {
            const settings = await apiService.getAdminSettings();
            setPlatformSettings(settings);
            setMaintenance(settings.maintenanceMode);
            setKillSwitch(settings.globalKillSwitch);
            setReqLimit(settings.globalRateLimit || 50);
        } catch (err) {
            console.error("Failed to fetch platform settings", err);
        }
    };

    const handleToggleMaintenance = async () => {
        try {
            const newVal = !maintenance;
            await apiService.updateMaintenanceMode(newVal);
            setMaintenance(newVal);
            toast.success(`Maintenance mode ${newVal ? 'ENABLED' : 'DISABLED'}`);
        } catch (err) {
            toast.error("Failed to toggle maintenance mode");
        }
    };

    const handleToggleKillSwitch = async () => {
        try {
            const newVal = !killSwitch;
            await apiService.updateKillSwitch(newVal);
            setKillSwitch(newVal);
            toast.success(`Global kill-switch ${newVal ? 'ACTIVATED' : 'DEACTIVATED'}`);
        } catch (err) {
            toast.error("Failed to toggle kill-switch");
        }
    };

    const handleRateLimitChange = async (e) => {
        const val = parseInt(e.target.value);
        setReqLimit(val);
    };

    const saveRateLimit = async () => {
        try {
            await apiService.updateRateLimit(reqLimit);
            toast.success("Rate limit updated successfully");
        } catch (err) {
            toast.error("Failed to update rate limit");
        }
    };

    const handleToggleSignup = async () => {
        try {
            const nextSettings = { ...platformSettings, allowPublicSignup: !platformSettings.allowPublicSignup };
            await apiService.updateAdminSettings(nextSettings);
            setPlatformSettings(nextSettings);
            toast.success(`Public signups ${nextSettings.allowPublicSignup ? 'ENABLED' : 'DISABLED'}`);
        } catch (err) {
            toast.error("Failed to update signup logic");
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const url = await apiService.uploadFile(file);
            setProfile(prev => ({ ...prev, avatar: url }));
            toast.success("Avatar uploaded successfully!");
        } catch (error) {
            toast.error("Failed to upload avatar");
        }
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            await apiService.updateProfile(profile);
            toast.success("Profile updated successfully!");
            // Notify other components that profile was updated
            window.dispatchEvent(new Event('profileUpdated'));
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 pb-24"
        >
            <div className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6 text-[#8b5cf6]" />
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Platform Settings & Safety</h2>
            </div>

            {/* User Profile Configuration */}
            <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] p-8 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-[#d946ef]/10 rounded-2xl text-[#d946ef]">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">User Profile</h2>
                        <p className="text-gray-500 font-medium text-xs mt-0.5">Manage your personal admin account details</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] p-1 shadow-2xl relative group cursor-pointer overflow-hidden">
                            <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-8 h-8 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile Picture</p>
                    </div>

                    {/* Profile Fields */}
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleProfileChange}
                                    className="w-full bg-white/50 border border-gray-200 rounded-[16px] px-5 py-3 pl-12 font-bold text-sm text-gray-900 outline-none focus:ring-4 focus:ring-[#d946ef]/10 focus:border-[#d946ef] transition-all placeholder:text-gray-300"
                                />
                                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d946ef] transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleProfileChange}
                                    className="w-full bg-white/50 border border-gray-200 rounded-[16px] px-5 py-3 pl-12 font-bold text-sm text-gray-900 outline-none focus:ring-4 focus:ring-[#d946ef]/10 focus:border-[#d946ef] transition-all placeholder:text-gray-300"
                                />
                                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#d946ef] transition-colors" />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                            <button
                                onClick={handleSaveProfile}
                                disabled={loading}
                                className="px-8 py-3 bg-[#d946ef] text-white rounded-[16px] font-black text-[10px] uppercase tracking-widest hover:bg-[#c026d3] shadow-lg shadow-[#d946ef]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* General Config */}
            <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] p-8 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)]">
                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2 uppercase">
                    <Settings className="w-5 h-5 text-[#8b5cf6]" />
                    General Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Platform Name</label>
                        <input
                            type="text"
                            defaultValue="AI-MALL"
                            className="w-full bg-white/60 border border-white/80 rounded-[16px] px-6 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all uppercase tracking-wide placeholder-gray-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Contact Email</label>
                        <input
                            type="text"
                            defaultValue="support@aimall.com"
                            className="w-full bg-white/60 border border-white/80 rounded-[16px] px-6 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all tracking-wide placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* Safety & Emergency */}
            <div className="bg-red-50/50 backdrop-blur-3xl border border-red-100/60 rounded-[32px] p-8 shadow-[0_20px_40px_-20px_rgba(239,68,68,0.05)]">
                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2 uppercase">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    Safety & Emergency Controls
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 bg-white/60 rounded-[24px] border border-white/80 transition-all hover:bg-white/80 hover:shadow-sm group">
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-gray-900 uppercase tracking-tight">Public Registration</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Allow new users to create accounts independently.</p>
                        </div>
                        <button
                            onClick={handleToggleSignup}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${platformSettings.allowPublicSignup ? 'bg-indigo-500' : 'bg-gray-200'}`}
                        >
                            <motion.div
                                animate={{ x: platformSettings.allowPublicSignup ? 24 : 0 }}
                                className="w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white/60 rounded-[24px] border border-white/80 transition-all hover:bg-white/80 hover:shadow-sm group">
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-gray-900 uppercase tracking-tight">Maintenance Mode</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disable user access for system upgrades.</p>
                        </div>
                        <button
                            onClick={handleToggleMaintenance}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${maintenance ? 'bg-emerald-500' : 'bg-gray-200'}`}
                        >
                            <motion.div
                                animate={{ x: maintenance ? 24 : 0 }}
                                className="w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white/60 rounded-[24px] border border-red-100 transition-all hover:bg-red-50/50 hover:shadow-sm hover:border-red-200 group">
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-red-500 uppercase tracking-tight">Global Kill-Switch</p>
                            <p className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest">Immediately disable ALL AI Agent inference APIs.</p>
                        </div>
                        <button
                            onClick={handleToggleKillSwitch}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${killSwitch ? 'bg-red-500' : 'bg-gray-200'}`}
                        >
                            <motion.div
                                animate={{ x: killSwitch ? 24 : 0 }}
                                className="w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* API Controls */}
            <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[32px] p-8 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)]">
                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2 uppercase">
                    <Activity className="w-5 h-5 text-[#8b5cf6]" />
                    API Rate Limits
                </h3>
                <div className="p-6 bg-white/40 rounded-[24px] border border-white/60">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Global Requests Per Minute</label>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-[#8b5cf6]">{reqLimit}k</span>
                            <button
                                onClick={saveRateLimit}
                                className="px-3 py-1 bg-[#8b5cf6] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={reqLimit}
                        onChange={handleRateLimitChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8b5cf6] hover:accent-[#7c3aed] transition-all"
                    />
                    <div className="flex justify-between text-[9px] font-black text-gray-400 mt-3 uppercase tracking-widest">
                        <span>1k</span>
                        <span>50x</span>
                        <span>100k</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PlatformSettings;
