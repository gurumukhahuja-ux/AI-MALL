import React, { useEffect, useState } from 'react';
import { Plus, Settings, Trash2, Bot, Code, Edit3, Save, FileText, Download, Star, Play, Sparkles, Activity, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import { apiService } from '../services/apiService';
import axios from 'axios';
import { apis, AppRoute } from '../types';
import { getUserData } from '../userStore/userData';
import { useNavigate, Link } from 'react-router';
import AgentModal from '../Components/AgentModal/AgentModal';
import { motion, AnimatePresence } from 'framer-motion';

const MyAgents = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [editedInstructions, setEditedInstructions] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Modal State
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const user = getUserData("user")
    const navigate = useNavigate()

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        setLoading(true);
        const userId = user?.id || user?._id;
        try {
            const res = await axios.post(apis.getUserAgents, { userId });
            setAgents(res.data.agents);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAgent = async () => {
        const newAgent = {
            name: 'New Agent',
            description: 'A new custom assistant.',
            type: 'general',
            instructions: 'You are a helpful assistant.'
        };
        await apiService.createAgent(newAgent);
        loadAgents();
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this agent?')) {
            await apiService.deleteAgent(id);
            loadAgents();
        }
    };

    return (
        <div className="flex-1 overflow-y-auto px-6 py-8 md:p-8 lg:p-12 no-scrollbar bg-transparent relative">
            {/* Decorative Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#8b5cf6]/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-[#d946ef]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 md:mb-20 relative z-10">
                <div className="space-y-2 md:space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-tight">
                        My <span className="text-[#8b5cf6]">Agents.</span>
                    </h1>
                    <p className="text-gray-400 font-bold text-lg md:text-xl tracking-tight max-w-xl opacity-70 leading-snug">
                        Manage your personalized AI assistants.
                    </p>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto">
                    <button
                        onClick={() => navigate(AppRoute.MARKETPLACE)}
                        className="w-full md:w-auto px-8 md:px-12 py-5 md:py-6 bg-gray-900 text-white font-black rounded-[24px] md:rounded-[32px] shadow-2xl transition-all hover:bg-[#8b5cf6] hover:scale-105 active:scale-95 uppercase text-[10px] md:text-xs tracking-[0.3em] flex items-center justify-center gap-3 md:gap-4 group"
                    >
                        <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Acquire New Agent
                    </button>
                </div>
            </header>

            {/* Content Section */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-[6px] border-[#8b5cf6]/10 border-t-[#8b5cf6] animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-[#8b5cf6] animate-pulse" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.5em] animate-pulse">Syncing Core Registry...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 relative z-10">
                    <AnimatePresence mode="popLayout">
                        {/* Agents Grid */}
                        {agents.map((agent, index) => (
                            <motion.div
                                key={agent._id}
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -10 }}
                                className="bg-white/40 backdrop-blur-3xl border border-white/80 rounded-[40px] md:rounded-[56px] p-8 md:p-10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(139,92,246,0.15)] transition-all duration-700 group relative overflow-hidden flex flex-col h-full border-b-4 border-b-white/50"
                            >
                                {/* Decorative Glow */}
                                <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#8b5cf6]/5 rounded-full blur-[100px] group-hover:bg-[#8b5cf6]/10 transition-all duration-1000"></div>

                                <div className="flex justify-between items-start mb-8 md:mb-10 relative z-10">
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[24px] md:rounded-[32px] p-1.5 flex items-center justify-center shadow-2xl border border-gray-50 group-hover:scale-110 transition-all duration-700 overflow-hidden">
                                        <img
                                            src={agent.avatar || `https://ui-avatars.com/api/?name=${agent.agentName}&background=8b5cf6&color=fff`}
                                            className="w-full h-full object-cover rounded-[18px] md:rounded-[24px]"
                                            alt={agent.agentName}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[8px] md:text-[10px] font-black text-emerald-700 tracking-widest uppercase">STABLE_LINK</span>
                                    </div>
                                </div>

                                <div className="flex-1 relative z-10 space-y-3 md:space-y-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">{agent.agentName}</h3>
                                        <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-tighter border border-[#8b5cf6]/20 px-1.5 rounded-md">TM</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.3em] opacity-80">
                                        <Activity size={10} />
                                        {agent.category || 'General Intel'}
                                    </div>
                                    <p className="text-base md:text-lg text-gray-500 font-bold leading-relaxed mb-6 md:mb-10 h-24 line-clamp-3 opacity-70 group-hover:opacity-100 transition-opacity">
                                        {agent.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-6 md:mt-10 relative z-10 gap-4 md:gap-6 pt-6 border-t border-white/40">
                                    <button
                                        onClick={() => {
                                            const targetUrl = (!agent?.url || agent.url.trim() === "") ? AppRoute.agentSoon : agent.url;
                                            setSelectedAgent({ ...agent, url: targetUrl });
                                            setIsModalOpen(true);
                                        }}
                                        className="flex-1 py-6 bg-gray-900 text-white rounded-[28px] font-black text-[11px] shadow-2xl hover:bg-[#8b5cf6] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 uppercase tracking-[0.2em] group/launch"
                                    >
                                        <Play size={18} fill="currentColor" className="group-hover/launch:scale-110 transition-transform" />
                                        Initialize Link
                                    </button>
                                    <button
                                        onClick={() => navigate(AppRoute.INVOICES)}
                                        className="w-16 h-16 rounded-[24px] bg-white/60 border border-white text-gray-400 hover:text-[#8b5cf6] hover:bg-white transition-all shadow-sm flex items-center justify-center group/btn"
                                        title="View Registry Log"
                                    >
                                        <FileText size={22} className="group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Empty State / Create Card */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            onClick={() => navigate(AppRoute.MARKETPLACE)}
                            className="bg-white/20 backdrop-blur-3xl border-2 border-dashed border-gray-200/50 rounded-[56px] p-10 flex flex-col items-center justify-center text-center hover:border-[#8b5cf6]/50 hover:bg-white/40 transition-all duration-500 cursor-pointer group min-h-[450px]"
                        >
                            <div className="w-24 h-24 rounded-[32px] bg-white shadow-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 border border-gray-50">
                                <Plus className="w-10 h-10 text-gray-300 group-hover:text-[#8b5cf6] transition-colors" strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-4">Extend Fleet</h3>
                            <p className="text-lg text-gray-400 font-bold max-w-[240px] leading-tight">Identify and synchronize additional intelligence nodes from the global registry.</p>
                            <div className="mt-10 flex items-center gap-3 text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                Access Marketplace <ChevronRight size={14} />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

            <AgentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                agent={selectedAgent}
            />
        </div>
    );
};

export default MyAgents;
