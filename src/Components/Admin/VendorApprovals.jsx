import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Building2, Loader2, AlertCircle, Mail, Calendar } from 'lucide-react';
import apiService from '../../services/apiService';
import { useToast } from '../Toast/ToastContext';
import { motion } from 'framer-motion';

const VendorApprovals = () => {
    const toast = useToast();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [activeFilter, setActiveFilter] = useState('pending');
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAllVendors(activeFilter);
            setVendors(response.vendors || []);
        } catch (err) {
            console.error("Failed to fetch vendors:", err);
            toast?.error?.("Failed to load vendor requests");
            setVendors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, [activeFilter]);

    useEffect(() => {
        if (showRejectModal) {
            setTimeout(() => {
                const element = document.getElementById('rejection-reason-input');
                if (element) {
                    element.focus();
                }
            }, 100);
        }
    }, [showRejectModal]);

    const handleApprove = async () => {
        try {
            setProcessingId(selectedVendor._id);
            await apiService.approveVendor(selectedVendor._id);
            toast?.success?.(`${selectedVendor.name} approved successfully!`);
            setShowApproveModal(false);
            setSelectedVendor(null);
            fetchVendors();
        } catch (err) {
            console.error("Approval error:", err);
            toast?.error?.("Failed to approve vendor");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast?.error?.("Please provide a rejection reason");
            return;
        }
        try {
            setProcessingId(selectedVendor._id);
            await apiService.rejectVendor(selectedVendor._id, rejectionReason);
            toast?.success?.("Vendor application rejected");
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedVendor(null);
            fetchVendors();
        } catch (err) {
            console.error("Rejection error:", err);
            toast?.error?.("Failed to reject vendor");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-600 border-amber-100',
            approved: 'bg-green-50 text-green-600 border-green-100',
            rejected: 'bg-red-50 text-red-600 border-red-100'
        };
        return styles[status] || styles.pending;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Vendor <span className="text-[#8b5cf6]">Requests</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                        Registration Approval System
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-3">
                {['pending', 'approved', 'rejected', 'all'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === filter
                            ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/20'
                            : 'bg-white/40 backdrop-blur-3xl border border-white/60 text-slate-600 hover:text-[#8b5cf6]'
                            }`}
                    >
                        {filter}
                        {filter === 'pending' && vendors.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-[8px]">
                                {vendors.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Vendor Cards */}
            <div className="grid grid-cols-1 gap-6">
                {vendors.length > 0 ? (
                    vendors.map((vendor) => (
                        <motion.div
                            key={vendor._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8 rounded-[48px] group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-start gap-6 flex-1">
                                    {/* Avatar */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:rotate-6 transition-transform">
                                        {vendor.name?.charAt(0)?.toUpperCase() || 'V'}
                                    </div>

                                    {/* Vendor Info */}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#8b5cf6] transition-colors">
                                            {vendor.name}
                                        </h3>

                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-xs font-medium">{vendor.email}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/40">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Company</p>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-[#8b5cf6]" />
                                                    <p className="text-sm font-bold text-slate-900">{vendor.companyName || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</p>
                                                <span className="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                                                    {vendor.companyType || 'N/A'}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Registered</p>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <p className="text-sm font-bold text-slate-900">{formatDate(vendor.vendorRegisteredAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Actions */}
                                <div className="flex flex-col items-end gap-4">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(vendor.vendorStatus)}`}>
                                        {getStatusIcon(vendor.vendorStatus)}
                                        {vendor.vendorStatus}
                                    </div>

                                    {vendor.vendorStatus === 'pending' && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => { setSelectedVendor(vendor); setShowApproveModal(true); }}
                                                disabled={processingId === vendor._id}
                                                className="px-6 py-3 bg-[#8b5cf6] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all shadow-lg shadow-[#8b5cf6]/20 disabled:opacity-50"
                                            >
                                                {processingId === vendor._id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => { setSelectedVendor(vendor); setShowRejectModal(true); }}
                                                disabled={processingId === vendor._id}
                                                className="px-6 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-slate-900/10"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {vendor.vendorStatus === 'rejected' && vendor.rejectionReason && (
                                        <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 max-w-md">
                                            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Rejection Reason</p>
                                            <p className="text-xs text-red-600 font-medium">{vendor.rejectionReason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="glass-card p-24 rounded-[56px] text-center">
                        <div className="w-20 h-20 bg-[#8b5cf6]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-10 h-10 text-[#8b5cf6]" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Vendor Requests</h3>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                            {activeFilter === 'pending' ? 'No pending vendor applications' : `No ${activeFilter} vendors found`}
                        </p>
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            {showApproveModal && selectedVendor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-lg rounded-[56px] overflow-hidden border-white/80"
                    >
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <CheckCircle className="w-10 h-10 text-[#22C55E]" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Approve Vendor</h2>
                            <p className="text-sm text-slate-500 font-medium mb-8">
                                Approve <span className="font-black text-slate-900">{selectedVendor.name}</span> from <span className="font-black text-slate-900">{selectedVendor.companyName}</span>?
                                They will receive an email notification and can access their vendor dashboard.
                            </p>

                            <div className="flex items-center gap-6 mt-10">
                                <button
                                    onClick={() => setShowApproveModal(false)}
                                    className="flex-1 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={processingId}
                                    className="flex-1 bg-[#8b5cf6] text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all shadow-2xl shadow-[#8b5cf6]/20 disabled:opacity-50"
                                >
                                    {processingId ? 'Processing...' : 'Confirm Approval'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && selectedVendor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-lg rounded-[56px] overflow-hidden border-white/80"
                    >
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <AlertCircle className="w-10 h-10 text-[#EF4444]" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Reject Application</h2>
                            <p className="text-sm text-slate-500 font-medium mb-8">
                                Please provide a reason for rejecting <span className="font-black text-slate-900">{selectedVendor.name}</span>'s application.
                                This will be sent to them via email.
                            </p>

                            <textarea
                                id="rejection-reason-input"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full bg-white/60 border border-white/80 rounded-[32px] p-6 text-sm outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none h-40 font-medium placeholder:text-slate-300"
                                placeholder="Specify rejection reason (required)..."
                            />

                            <div className="flex items-center gap-6 mt-10">
                                <button
                                    onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}
                                    className="flex-1 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectionReason.trim() || processingId}
                                    className="flex-1 bg-red-500 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50"
                                >
                                    {processingId ? 'Processing...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default VendorApprovals;
