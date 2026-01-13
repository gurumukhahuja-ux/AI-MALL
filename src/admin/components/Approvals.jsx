import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Loader2, AlertCircle, ShieldCheck, UserCheck, Mail, X, Send } from 'lucide-react';
import apiService from '../../services/apiService';
import { motion } from 'framer-motion';

const Approvals = () => {
    const [activeSubTab, setActiveSubTab] = useState('apps'); // 'apps', 'vendors', 'registered'
    const [pendingAgents, setPendingAgents] = useState([]);
    const [pendingDeletions, setPendingDeletions] = useState([]);
    const [pendingVendors, setPendingVendors] = useState([]);
    const [approvedVendors, setApprovedVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approvalMessage, setApprovalMessage] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Contact Modal State
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactSubject, setContactSubject] = useState('');
    const [contactMessage, setContactMessage] = useState('');

    const fetchData = async () => {
        // Fetching approvals data...
        try {
            setLoading(true);
            const [statsData, vendorData, allVendorData] = await Promise.all([
                apiService.getAdminOverviewStats(),
                apiService.getPendingVendors(),
                apiService.getAllVendors('all')
            ]);

            const agents = statsData?.inventory || [];
            const pending = agents.filter(a => a.reviewStatus === 'Pending Review');
            const deletions = agents.filter(a => a.deletionStatus === 'Pending');

            setPendingAgents(pending);
            setPendingDeletions(deletions);

            // Filter approved vendors on frontend to be safe
            const approved = (allVendorData?.vendors || []).filter(v => v.vendorStatus === 'approved');
            setApprovedVendors(approved);

            setPendingVendors(vendorData?.success ? vendorData.vendors : []);
        } catch (err) {
            console.error("Failed to fetch approvals data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async () => {
        try {
            const id = selectedItem._id || selectedItem.id;
            setProcessingId(id);

            if (activeSubTab === 'vendors') {
                await apiService.approveVendor(id);
                setPendingVendors(prev => prev.filter(v => v._id !== id));
                // Refresh approved list
                const allVendors = await apiService.getAllVendors('all');
                const approved = (allVendors?.vendors || []).filter(v => v.vendorStatus === 'approved');
                setApprovedVendors(approved);
            } else if (activeSubTab === 'deletions') {
                await apiService.approveDeletion(id);
                setPendingDeletions(prev => prev.filter(a => (a._id || a.id) !== id));
            } else {
                await apiService.approveAgent(id, approvalMessage);
                setPendingAgents(prev => prev.filter(a => (a._id || a.id) !== id));
            }

            setShowApproveModal(false);
            setApprovalMessage('');
            setSelectedItem(null);
        } catch (err) {
            const msg = err.response?.data?.error || err.message || "Approval failed";
            alert(`Error: ${msg}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) return;
        try {
            const id = selectedItem._id || selectedItem.id;
            setProcessingId(id);

            if (activeSubTab === 'vendors') {
                await apiService.rejectVendor(id, rejectionReason);
                setPendingVendors(prev => prev.filter(v => v._id !== id));
            } else if (activeSubTab === 'deletions') {
                await apiService.rejectDeletion(id, rejectionReason);
                setPendingDeletions(prev => prev.filter(a => (a._id || a.id) !== id));
            } else {
                await apiService.rejectAgent(id, rejectionReason);
                setPendingAgents(prev => prev.filter(a => (a._id || a.id) !== id));
            }

            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedItem(null);
        } catch (err) {
            const msg = err.response?.data?.error || err.message || "Action failed";
            alert(`Failed: ${msg}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleContactVendor = async () => {
        if (!selectedItem?.email) return;

        try {
            await apiService.contactVendor({
                senderType: 'Admin',
                userName: 'Admin',
                userEmail: 'admin@aimall.com',
                agentId: selectedItem.agentId || selectedItem._id || selectedItem.id, // Agent ID if applicable
                agentName: selectedItem.agentName || selectedItem.name || 'Platform Support',
                subject: contactSubject,
                message: contactMessage,
                userId: null // Admin doesn't need a specific user ID in the User collection for this
            });

            // Show Success Alert
            alert("Message sent to vendor successfully!");

        } catch (err) {
            console.error(err);
            alert("Failed to send message: " + (err.response?.data?.error || err.message));
        }

        setShowContactModal(false);
        setContactSubject('');
        setContactMessage('');
        setSelectedItem(null);
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-[24px] bg-[#8b5cf6]/20 flex items-center justify-center animate-spin">
                    <Loader2 className="w-8 h-8 text-[#8b5cf6]" />
                </div>
                <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.4em]">Loading Approvals...</p>
            </div>
        );
    }

    const getCurrentList = () => {
        switch (activeSubTab) {
            case 'vendors': return pendingVendors;
            case 'registered': return approvedVendors;
            case 'deletions': return pendingDeletions;
            default: return pendingAgents;
        }
    };

    const currentList = getCurrentList();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 pb-24"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">Approvals & Consistency</h2>
                    <p className="text-gray-500 font-medium text-xs">Review and manage app submissions, vendor requests, and verified partners</p>
                </div>

                <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-[24px] border border-white/60 shadow-sm self-start overflow-x-auto">
                    <button
                        onClick={() => setActiveSubTab('apps')}
                        className={`px-6 py-2 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'apps' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                        App Reviews ({pendingAgents.length})
                    </button>
                    <button
                        onClick={() => setActiveSubTab('vendors')}
                        className={`px-6 py-2 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'vendors' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                        Vendor Requests ({pendingVendors.length})
                    </button>
                    <button
                        onClick={() => setActiveSubTab('deletions')}
                        className={`px-6 py-2 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'deletions' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-red-500 hover:bg-red-50'}`}
                    >
                        Deletions ({pendingDeletions.length})
                    </button>
                    <button
                        onClick={() => setActiveSubTab('registered')}
                        className={`px-6 py-2 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'registered' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                        Registered Vendors ({approvedVendors.length})
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {currentList.length > 0 ? (
                    currentList.map((item) => (
                        <div key={item._id || item.id} className="glass-card p-5 rounded-[32px] group relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/60">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                            <div className="flex items-center justify-between relative z-10 flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/60 backdrop-blur-md glass-card rounded-2xl flex items-center justify-center overflow-hidden border border-white/80 group-hover:rotate-6 transition-transform">
                                        <img src={item.avatar || 'https://cdn-icons-png.flaticon.com/512/2102/2102633.png'} alt="" className="w-10 h-10 object-contain" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-[#8b5cf6] transition-colors">{item.name || item.agentName}</h3>
                                            {activeSubTab === 'registered' && <span className="text-[8px] font-black bg-emerald-50 text-emerald-500 border border-emerald-100 px-1.5 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={10} /> Verified Vendor</span>}
                                            {activeSubTab === 'vendors' && <span className="text-[8px] font-black bg-blue-50 text-blue-500 border border-blue-100 px-1.5 py-0.5 rounded-md uppercase tracking-widest">Vendor Application</span>}
                                            {activeSubTab === 'deletions' && <span className="text-[8px] font-black bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1"><AlertCircle size={10} /> Deletion Request</span>}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            {activeSubTab === 'vendors' || activeSubTab === 'registered' ? (
                                                <>
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.email}</span>
                                                    <span className="bg-white/60 text-gray-500 border border-white/80 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">{item.companyName || 'Individual'}</span>
                                                    {activeSubTab === 'registered' && item.apps && item.apps.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2 w-full">
                                                            {item.apps.map(app => (
                                                                <span key={app.slug} className="bg-[#8b5cf6]/10 text-[#8b5cf6] px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-[#8b5cf6]/20">
                                                                    {app.agentName}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {activeSubTab === 'registered' && (!item.apps || item.apps.length === 0) && (
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">No apps created yet</span>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <span className="bg-white/60 text-gray-500 border border-white/80 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">{item.category || 'General'}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                                        Source: {item.source || 'External Vendor'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {activeSubTab === 'registered' ? (
                                        <>
                                            <button
                                                onClick={() => { setSelectedItem(item); setShowContactModal(true); }}
                                                className="px-6 py-2.5 bg-[#8b5cf6] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-[#8b5cf6]/20 flex items-center gap-2"
                                            >
                                                <Mail size={14} /> Contact Vendor
                                            </button>
                                            <button className="px-6 py-2.5 bg-white border border-white/60 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest cursor-default flex items-center gap-2 shadow-sm">
                                                <UserCheck size={14} /> Active
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setSelectedItem(item); setShowApproveModal(true); }}
                                                disabled={processingId === (item._id || item.id)}
                                                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-xl bg-[#8b5cf6] text-white shadow-[#8b5cf6]/10 hover:bg-[#7c3aed]`}
                                            >
                                                {processingId === (item._id || item.id) ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                                                    activeSubTab === 'vendors' ? 'Approve Vendor' : activeSubTab === 'deletions' ? 'Approve Deletion' : 'Approve App'
                                                )}
                                            </button>
                                            <button
                                                onClick={() => { setSelectedItem(item); setShowRejectModal(true); }}
                                                disabled={processingId === (item._id || item.id)}
                                                className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/40">
                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic opacity-80 line-clamp-2">
                                    "{item.description || item.bio || 'No description provided.'}"
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[56px] h-[40vh] flex flex-col items-center justify-center text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
                        <div className="w-20 h-20 bg-gray-50/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-white">
                            <Clock className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Workspace Empty</h3>
                        <p className="text-slate-500 font-medium">No {activeSubTab === 'vendors' ? 'pending vendor requests' : activeSubTab === 'registered' ? 'registered vendors' : activeSubTab === 'deletions' ? 'deletion requests' : 'app reviews'} at the moment.</p>
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                    <div className="bg-white/90 backdrop-blur-3xl w-full max-w-lg rounded-[56px] overflow-hidden border border-white/80 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-12 text-center">
                            <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner border border-white ${activeSubTab === 'deletions' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                {activeSubTab === 'deletions' ? <AlertCircle className="w-12 h-12" /> : <CheckCircle className="w-12 h-12" />}
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
                                {activeSubTab === 'deletions' ? 'Approve Removal' :
                                    activeSubTab === 'vendors' ? 'Approve Vendor' : 'Approve Agent'}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium mb-8">
                                {activeSubTab === 'deletions'
                                    ? `This will permanently remove '${selectedItem?.name || 'the item'}' and cancel all active subscriptions. This action is irreversible.`
                                    : activeSubTab === 'vendors'
                                        ? `This will grant '${selectedItem?.name}' access to the Vendor Dashboard. They will be notified via email.`
                                        : 'Is this agent ready to go live? You can add a note for the vendor.'}
                            </p>

                            {activeSubTab === 'apps' && (
                                <textarea
                                    value={approvalMessage}
                                    onChange={(e) => setApprovalMessage(e.target.value)}
                                    className="w-full bg-white/60 border border-white/80 rounded-[32px] p-6 text-sm outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all resize-none h-40 font-medium placeholder:text-slate-300 shadow-inner"
                                    placeholder="Add a note (Optional)..."
                                />
                            )}

                            <div className="flex items-center gap-6 mt-10">
                                <button
                                    onClick={() => setShowApproveModal(false)}
                                    className="flex-1 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-slate-500 hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={processingId}
                                    className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl transform active:scale-95 ${activeSubTab === 'deletions' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-[#8b5cf6] hover:bg-[#7c3aed] shadow-[#8b5cf6]/20'}`}
                                >
                                    {activeSubTab === 'deletions' ? 'Confirm Removal' :
                                        activeSubTab === 'vendors' ? 'Confirm Approval' : 'Publish Agent'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                    <div className="bg-white/90 backdrop-blur-3xl w-full max-w-lg rounded-[56px] overflow-hidden border border-white/80 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-12 text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner border border-white">
                                <AlertCircle className="w-12 h-12 text-gray-400" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Reject Request</h2>
                            <p className="text-sm text-slate-500 font-medium mb-8">Please provide a reason for rejecting this {activeSubTab === 'vendors' ? 'application' : activeSubTab === 'deletions' ? 'deletion request' : 'submission'}.</p>

                            <textarea
                                id="rejection-reason-input"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full bg-white/60 border border-white/80 rounded-[32px] p-6 text-sm outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none h-40 font-medium placeholder:text-slate-300 shadow-inner"
                                placeholder="Reason for rejection..."
                            />

                            <div className="flex items-center gap-6 mt-10">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-slate-500 hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectionReason.trim() || processingId}
                                    className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                                >
                                    Confirm Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Contact Modal */}
            {showContactModal && selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Contact Vendor</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regarding:</span>
                                        <span className="bg-[#8b5cf6]/10 text-[#8b5cf6] px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest">
                                            {selectedItem.name || selectedItem.agentName}
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
                                onClick={handleContactVendor}
                                disabled={!contactSubject.trim() || !contactMessage.trim()}
                                className="w-full mt-8 py-4 bg-[#0F172A] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Send size={14} /> Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Approvals;
