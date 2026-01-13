import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import PrimaryButton from './PrimaryButton';
import { ShieldCheck, Info, Users, Archive, AlertCircle, X, Send, Layers, Activity, Globe, Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppDetail = ({ app, usage, onDeactivate, onReactivate, onSubmitForReview, onDelete, onUpdateUrl, onBack }) => {
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [url, setUrl] = useState(app.url || '');
    const [isEditingUrl, setIsEditingUrl] = useState(false);

    const handleSaveUrl = () => {
        onUpdateUrl(url);
        setIsEditingUrl(false);
    };

    if (!app) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] overflow-hidden"
        >
            {/* Header Section */}
            <div className="p-8 border-b border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/20">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-white to-gray-50 flex items-center justify-center text-[#8b5cf6] overflow-hidden border border-white/60 shadow-lg relative group">
                        <div className="absolute inset-0 bg-[#8b5cf6]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {app.avatar ? (
                            <img src={app.avatar} alt={app.agentName} className="w-full h-full object-cover" />
                        ) : (
                            <ShieldCheck size={36} />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{app.agentName}</h2>
                            <StatusBadge status={app.reviewStatus === 'Pending Review' ? 'Pending Review' : app.status} />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-100/50 border border-emerald-200/60">
                                <Activity size={12} className="text-emerald-600" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">System Healthy</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ID: {app._id ? app._id.slice(-6) : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto flex-wrap justify-end">
                    <button onClick={onBack} className="px-5 py-2.5 rounded-xl bg-white/40 border border-white/60 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-white hover:text-gray-900 transition-all shadow-sm">
                        Back
                    </button>

                    {/* Consolidated Action Buttons */}
                    {/* Reactivate: Only for Inactive */}
                    {app.status === 'Inactive' && (
                        <button onClick={() => setIsReactivateModalOpen(true)} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                            <ShieldCheck size={14} /> Reactivate
                        </button>
                    )}

                    {/* Submit: For Draft, Rejected, OR Inactive */}
                    {(app.status === 'Draft' || app.status === 'Rejected' || app.status === 'Inactive') && (
                        <button onClick={() => setIsSubmitModalOpen(true)} className="px-5 py-2.5 rounded-xl bg-[#8b5cf6] text-white text-xs font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all shadow-lg shadow-[#8b5cf6]/30 flex items-center gap-2">
                            <Send size={14} /> {app.status === 'Rejected' ? 'Resubmit App' : 'Submit Review'}
                        </button>
                    )}

                    {/* Deactivate: For Live or Under Review */}
                    {(app.status === 'Live' || app.status === 'Under Review') && (
                        <button onClick={() => setIsDeactivateModalOpen(true)} className="px-5 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2">
                            <Archive size={14} /> {app.status === 'Under Review' ? 'Cancel Review' : 'Deactivate'}
                        </button>
                    )}

                    {/* Delete: ALWAYS Valid (unless already pending) */}
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        disabled={app.deletionStatus === 'Pending'}
                        className={`px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${app.deletionStatus === 'Pending'
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500 hover:text-white'
                            }`}
                    >
                        <Trash2 size={14} /> {app.deletionStatus === 'Pending' ? 'Deletion Pending' : 'Delete'}
                    </button>

                </div>
            </div>

            {app.deletionStatus === 'Pending' && (
                <div className="mx-8 mt-8 p-6 bg-red-50 border border-red-100 rounded-[24px] flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Deletion Request Pending</h4>
                        <p className="text-xs font-medium text-red-600/80">Admin protocol is reviewing your termination request. All neural connections will be severed upon approval.</p>
                    </div>
                </div>
            )}

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Basic Info & Description */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h3 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                            <Info size={14} /> Agent Description
                        </h3>
                        <div className="p-6 bg-white/30 rounded-[24px] border border-white/40 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm font-medium">
                                {app.description}
                            </p>
                        </div>
                    </section>

                    {/* App URL Configuration */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                <Globe size={14} /> Access Configuration
                            </h3>
                            {!isEditingUrl ? (
                                <button onClick={() => setIsEditingUrl(true)} className="flex items-center gap-1 text-[#8b5cf6] text-[10px] font-black uppercase tracking-widest hover:underline">
                                    <Edit3 size={12} /> Edit Endpoint
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditingUrl(false)} className="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600">Cancel</button>
                                    <button onClick={handleSaveUrl} className="text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:text-emerald-600">Save Changes</button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/30 rounded-[24px] p-6 border border-white/40 shadow-sm group hover:bg-white/50 transition-colors">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Primary Neural Endpoint</label>
                            {isEditingUrl ? (
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b5cf6] outline-none text-sm font-medium"
                                    placeholder="https://yourapp.com"
                                    autoFocus
                                />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500">
                                        <Globe size={16} />
                                    </div>
                                    <div className="truncate">
                                        {app.url ? (
                                            <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-sm hover:underline tracking-tight">{app.url}</a>
                                        ) : (
                                            <span className="text-gray-400 italic text-sm font-medium">No endpoint configured</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            <p className="text-[10px] text-gray-400 font-bold mt-3 uppercase tracking-wide">Destination for subscribed user traffic</p>
                        </div>
                    </section>

                    <section className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[32px] p-8 border border-blue-100 flex items-center justify-between">
                        <div>
                            <h3 className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
                                <Users size={14} /> Active connections
                            </h3>
                            <p className="text-sm font-bold text-blue-800/60">Total users currently interacting with this agent.</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black text-blue-600 tracking-tighter">{usage.totalUsers}</span>
                        </div>
                    </section>
                </div>

                {/* Subscription Breakdown */}
                <div className="space-y-6">
                    <section className="bg-white/30 rounded-[32px] p-8 border border-white/40 shadow-sm h-full">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Subscription Models</h3>
                        <div className="space-y-4">
                            {usage.planBreakdown.map((plan, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-white/60 rounded-[20px] border border-white shadow-sm transition-all hover:scale-[1.02] group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs group-hover:bg-[#8b5cf6] group-hover:text-white transition-colors">
                                            {plan.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-bold text-gray-800">{plan.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                        <span className="text-sm font-black text-gray-900">{plan.users}</span>
                                        <span className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Users</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing</span>
                                <span className="text-xs font-black text-gray-900">Dynamic / Fixed</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Plans</span>
                                <span className="text-xs font-black text-[#8b5cf6]">3 Active</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Visibility</span>
                                <span className="text-xs font-black text-emerald-600">Public Network</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Deactivate Confirmation Modal */}
            <AnimatePresence>
                {isDeactivateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl border border-white/20"
                        >
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6 mx-auto">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 text-center tracking-tight">Deactivate Agent?</h3>
                            <p className="text-gray-500 mb-8 text-center font-medium">
                                Are you sure you want to suspend <strong>{app.agentName}</strong>? This will immediately remove it from public access.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setIsDeactivateModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-[16px] text-xs font-black uppercase tracking-widest transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => { onDeactivate(); setIsDeactivateModalOpen(false); }} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-[16px] text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-amber-500/30">
                                    Confirm Suspend
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reactivate, Delete, Submit Modals would follow similar pattern - keeping concise for length */}
            {/* Reactivate Modal */}
            {isReactivateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 mx-auto">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-center mb-2">Reactivate Agent?</h3>
                        <p className="text-gray-500 text-center mb-8">Agent will respond to signals immediately.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsReactivateModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-[16px] font-bold text-sm">Cancel</button>
                            <button onClick={() => { onReactivate(); setIsReactivateModalOpen(false); }} className="flex-1 py-3 bg-green-600 text-white rounded-[16px] font-bold text-sm">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {isSubmitModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 mx-auto">
                            <Send size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-center mb-2">Submit for Review?</h3>
                        <p className="text-gray-500 text-center mb-8">Admin protocol will review your agent code.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsSubmitModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-[16px] font-bold text-sm">Cancel</button>
                            <button onClick={() => { onSubmitForReview(); setIsSubmitModalOpen(false); }} className="flex-1 py-3 bg-blue-600 text-white rounded-[16px] font-bold text-sm">Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 mx-auto">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-center mb-2 text-red-600">Terminate Agent?</h3>
                        <p className="text-gray-500 text-center mb-8">This action is irreversible. All data will be purged.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-[16px] font-bold text-sm">Cancel</button>
                            <button onClick={() => { onDelete(); setIsDeleteModalOpen(false); }} className="flex-1 py-3 bg-red-600 text-white rounded-[16px] font-bold text-sm">Terminate</button>
                        </div>
                    </div>
                </div>
            )}

        </motion.div>
    );
};

export default AppDetail;
