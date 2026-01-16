import React, { useState } from 'react';
import { Shield, Check, Info, ArrowLeft, Trash2, Globe, Loader2, Share2, Eye, Box, Activity } from 'lucide-react';
import apiService from '../../services/apiService';
import { getUserData } from '../../userStore/userData';
import { motion } from 'framer-motion';

const AppDetails = ({ app, onBack, onDelete, onUpdate, isAdmin: propsIsAdmin }) => {
    const [status, setStatus] = useState(app ? (app.status || 'Inactive') : 'Inactive');
    const [reviewStatus, setReviewStatus] = useState(app ? (app.reviewStatus || 'Draft') : 'Draft');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const userData = getUserData();
    const isAdmin = propsIsAdmin !== undefined ? propsIsAdmin : (userData?.role === 'admin');

    if (!app) return null;

    const handleGoLive = async () => {
        try {
            setIsUpdating(true);
            await apiService.updateAgent(app._id || app.id, { status: 'Live' });
            setStatus('Live');
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to go live:", error);
            alert("Failed to update status.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSubmitForReview = async () => {
        try {
            setIsUpdating(true);
            const updated = await apiService.submitForReview(app._id || app.id);
            setReviewStatus('Pending Review');
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert("Failed to submit for review.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${app.name || app.agentName}"? This will permanently remove all associated data and cannot be undone.`)) return;

        try {
            setIsDeleting(true);
            setDeleteError('');
            await apiService.deleteAgent(app._id || app.id);
            if (onDelete) onDelete();
        } catch (error) {
            console.error("Failed to delete app:", error);
            const msg = error.response?.data?.error || "Failed to delete agent. Access denied or server error.";
            setDeleteError(msg);
            alert(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    // Helper to safely render pricing
    const renderPricing = (pricing) => {
        if (!pricing) return 'Free';
        if (typeof pricing === 'string') return pricing;
        if (typeof pricing === 'object') {
            return pricing.amount || pricing.type || 'Custom';
        }
        return 'Unknown';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pb-24 space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white hover:text-[#8b5cf6] transition-all text-gray-500 shadow-sm border border-white/60"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">{app.name || app.agentName}</h1>
                        <div className="flex items-center gap-3">
                            {reviewStatus !== 'Approved' && (
                                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${reviewStatus === 'Pending Review' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    reviewStatus === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                        'bg-white/50 text-gray-500 border-gray-200'
                                    }`}>
                                    {reviewStatus}
                                </span>
                            )}
                            {status === 'Live' && (
                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Marketplace
                                </span>
                            )}
                            {app.deletionStatus === 'Pending' && (
                                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 animate-pulse">
                                    Pending Deletion
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {!isAdmin && (reviewStatus === 'Draft' || reviewStatus === 'Rejected') && (
                        <button
                            onClick={handleSubmitForReview}
                            disabled={isUpdating}
                            className="bg-gray-900 text-white px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-[#8b5cf6] hover:shadow-lg transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                            Submit for Review
                        </button>
                    )}

                    {isAdmin && status !== 'Live' && (
                        <button
                            onClick={handleGoLive}
                            disabled={isUpdating}
                            className="bg-emerald-500 text-white px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                            Publish Live
                        </button>
                    )}

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-white/40 border border-white/60 text-red-500 px-4 py-2.5 rounded-[20px] hover:bg-red-50 hover:text-red-600 transition-all shadow-sm flex items-center gap-2 group/del"
                    >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5 group-hover/del:scale-110 transition-transform" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">Delete Agent</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Rejection Alert */}
                    {reviewStatus === 'Rejected' && app.rejectionReason && (
                        <div className="bg-red-50 border border-red-100 rounded-[24px] p-6 flex gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                                <Info className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-red-900 tracking-tight mb-2">Submission Feedback</h3>
                                <p className="text-red-800 font-medium leading-relaxed">"{app.rejectionReason}"</p>
                                <p className="text-red-500 text-xs font-bold uppercase tracking-widest mt-4">Action Required</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[28px] p-8 shadow-sm space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Info className="w-4 h-4" /></div>
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Agent Description</h3>
                            </div>
                            <p className="text-base text-gray-600 font-medium leading-relaxed">
                                {app.description || 'No description provided.'}
                            </p>
                        </div>

                        <div className="pt-6 border-t border-white/60">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#8b5cf6]/10 rounded-lg text-[#8b5cf6]"><Globe className="w-4 h-4" /></div>
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Endpoint Configuration</h3>
                            </div>

                            <div className="bg-white/50 border border-white/80 rounded-[24px] p-5 group cursor-pointer hover:bg-white/80 transition-colors">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Live API URL</p>
                                <p className="text-[#8b5cf6] font-bold text-base break-all">{app.url || 'No URL configured'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-4">
                    <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[28px] p-6 shadow-sm">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Performance & Plan</h3>

                        <div className="space-y-4">
                            {/* Monthly Plan */}
                            <div className="flex items-center justify-between p-3 bg-white/40 rounded-[20px] border border-white/60">
                                <div className="flex items-center gap-3">
                                    <Box className="w-4 h-4 text-gray-400" />
                                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Monthly Plan</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">
                                    {app.pricing?.plans?.find(p => p.billingCycle === 'monthly')?.amount ? `₹${app.pricing.plans.find(p => p.billingCycle === 'monthly').amount}` : 'Free'}
                                </span>
                            </div>

                            {/* Yearly Plan */}
                            <div className="flex items-center justify-between p-3 bg-white/40 rounded-[20px] border border-white/60">
                                <div className="flex items-center gap-3">
                                    <Box className="w-4 h-4 text-gray-400" />
                                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Yearly Plan</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">
                                    {app.pricing?.plans?.find(p => p.billingCycle === 'yearly')?.amount ? `₹${app.pricing.plans.find(p => p.billingCycle === 'yearly').amount}` : 'Free'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white/40 rounded-[20px] border border-white/60">
                                <div className="flex items-center gap-3">
                                    <Eye className="w-4 h-4 text-gray-400" />
                                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Visibility</span>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'Live' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                    {status === 'Live' ? 'Public' : 'Private'}
                                </span>
                            </div>

                            <div className="p-5 bg-gradient-to-br from-[#8b5cf6]/5 to-[#d946ef]/5 rounded-[24px] border border-[#8b5cf6]/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-4 h-4 text-[#8b5cf6]" />
                                    <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest">Active Users</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{app.usageCount || 0}</p>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Installs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AppDetails;
