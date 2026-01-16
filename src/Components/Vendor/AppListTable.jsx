import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import PrimaryButton from './PrimaryButton';
import NewAppModal from './NewAppModal';
import { ChevronRight, Star, Mic, Layout, Box } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';

const AppListTable = ({ apps, onAppCreated }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAppCreated = (newApp) => {
        if (onAppCreated) {
            onAppCreated(newApp);
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] overflow-hidden"
            >
                <div className="px-8 py-6 border-b border-white/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-2xl shadow-sm">
                            <Box className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Your Agents</h3>
                            <p className="text-xs font-bold text-gray-500 mt-0.5">Manage your deployed AI agents</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-[#8b5cf6] text-white rounded-[20px] text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/30 hover:shadow-xl hover:bg-[#7c3aed] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
                    >
                        <span className="text-lg leading-none mb-0.5">+</span> Create New Agent
                    </button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead className="bg-white/20">
                            <tr>
                                <th scope="col" className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    Agent Name
                                </th>
                                <th scope="col" className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    Status
                                </th>
                                <th scope="col" className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                                    Rating
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/40">
                            {apps.map((app, index) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={app._id || app.id}
                                    className="hover:bg-white/40 cursor-pointer transition-all group"
                                    onClick={() => navigate(`/vendor/apps/${app._id || app.id}`)}
                                >
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-white/60 shadow-md flex items-center justify-center overflow-hidden relative group-hover:scale-110 transition-transform">
                                                {app.avatar ? (
                                                    <img src={app.avatar} alt="icon" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="bg-gradient-to-br from-gray-100 to-white w-full h-full flex items-center justify-center">
                                                        <Mic className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900 group-hover:text-[#8b5cf6] transition-colors mb-1">{app.agentName || app.name}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ID: {(app._id || app.id).slice(-6)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <StatusBadge status={app.deletionStatus === 'Pending' ? 'Pending Deletion' : (app.reviewStatus === 'Pending Review' || app.reviewStatus === 'Rejected') ? app.reviewStatus : app.status} />
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={14}
                                                        className={`${star <= (app.rating || 0)
                                                            ? 'text-amber-400 fill-amber-400'
                                                            : 'text-gray-200 fill-gray-100'
                                                            }`}
                                                    />
                                                ))}
                                                <span className="text-xs font-black text-amber-900 ml-2">{app.rating ? app.rating.toFixed(1) : '0.0'}</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-2 shadow-sm">
                                                <ChevronRight size={16} className="text-gray-400" />
                                            </div>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-white/40">
                    {apps.map((app, index) => (
                        <div
                            key={app._id || app.id}
                            className="p-6 transition-all active:bg-white/40"
                            onClick={() => navigate(`/vendor/apps/${app._id || app.id}`)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-white/60 shadow-md flex items-center justify-center overflow-hidden shrink-0">
                                        {app.avatar ? (
                                            <img src={app.avatar} alt="icon" className="w-full h-full object-cover" />
                                        ) : (
                                            <Mic className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-base font-black text-gray-900">{app.agentName || app.name}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: {(app._id || app.id).slice(-8)}</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 mt-2" />
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/40">
                                <StatusBadge status={(app.reviewStatus === 'Pending Review' || app.reviewStatus === 'Rejected') ? app.reviewStatus : app.status} />
                                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-black text-amber-900">{app.rating ? app.rating.toFixed(1) : '0.0'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {apps.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Box className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No Agents Deployed</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8 font-medium">Create your first AI agent to begin processing user interactions.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-4 bg-[#8b5cf6] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all"
                        >
                            Create First Agent
                        </button>
                    </div>
                )}
            </motion.div>

            {/* New App Modal */}
            <NewAppModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAppCreated={handleAppCreated}
            />
        </>
    );
};

export default AppListTable;
