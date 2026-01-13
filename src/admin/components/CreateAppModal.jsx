import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Sparkles, AlertCircle, Box, Layers, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateAppModal = ({ isOpen, onClose, onSubmit }) => {
    const initialFormData = {
        agentName: '',
        description: '',
        agentUrl: '',
        category: 'Business OS',
        pricing: 'Free'
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const resetForm = () => {
        setFormData(initialFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            resetForm();
            onClose();
        } catch (error) {
            console.error("Failed to create app:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return ReactDOM.createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white/40 backdrop-blur-3xl w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-white/40"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100/20 flex items-center justify-between bg-white/20">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg shadow-[#8b5cf6]/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Create New Agent</h2>
                                <p className="text-gray-500 font-medium mt-0.5 text-xs">Deploy a new AI agent to the AI-MALL marketplace</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 transition-all text-gray-400"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
                        <div className="bg-blue-50/30 border border-blue-100/50 rounded-[20px] p-4 flex gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 text-blue-600">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-900 uppercase tracking-wide mb-0.5">Draft Mode</p>
                                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                    Your agent will be created as a Draft. You can publish it later.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                                    Agent Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        name="agentName"
                                        required
                                        placeholder="e.g. SalesGPT Pro"
                                        autoComplete="off"
                                        value={formData.agentName}
                                        onChange={handleChange}
                                        className="w-full bg-white/20 border border-gray-200/50 rounded-[14px] px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] outline-none transition-all placeholder:text-gray-400 group-hover:bg-white/40"
                                    />
                                    <Box className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#8b5cf6] transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    required
                                    rows={3}
                                    placeholder="Describe your agent's capabilities..."
                                    value={formData.description}
                                    description={formData.description}
                                    onChange={handleChange}
                                    className="w-full bg-white/20 border border-gray-200/50 rounded-[14px] px-4 py-2.5 text-sm font-medium focus:ring-4 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] outline-none transition-all resize-none placeholder:text-gray-400 hover:bg-white/40"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                                    Agent Endpoint URL
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        name="agentUrl"
                                        placeholder="https://api.your-agent.com/v1..."
                                        value={formData.agentUrl}
                                        onChange={handleChange}
                                        className="w-full bg-white/20 border border-gray-200/50 rounded-[14px] px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] outline-none transition-all placeholder:text-gray-400 group-hover:bg-white/40"
                                    />
                                    <Layers className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#8b5cf6] transition-colors" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                                        Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full bg-white/20 border border-gray-200/50 rounded-[14px] px-4 py-2.5 text-xs font-bold focus:ring-4 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] outline-none transition-all appearance-none cursor-pointer hover:bg-white/40"
                                        >
                                            <option>Business OS</option>
                                            <option>Data & Intelligence</option>
                                            <option>Sales & Marketing</option>
                                            <option>HR & Finance</option>
                                            <option>Design & Creative</option>
                                            <option>Medical & Health</option>
                                            <option>Productivity</option>
                                        </select>
                                        <Layers className="w-3.5 h-3.5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                                        Pricing Model
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="pricing"
                                            value={formData.pricing}
                                            onChange={handleChange}
                                            className="w-full bg-white/20 border border-gray-200/50 rounded-[14px] px-4 py-2.5 text-xs font-bold focus:ring-4 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] outline-none transition-all appearance-none cursor-pointer hover:bg-white/40"
                                        >
                                            <option value="Free">Free</option>
                                            <option value="Prime (₹100/mo)">Prime (₹100/mo)</option>
                                            <option value="Pro (₹1000/yr)">Pro (₹1000/yr)</option>
                                        </select>
                                        <Zap className="w-3.5 h-3.5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100/20 bg-white/10 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-white/40 hover:text-gray-900 hover:shadow-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-gray-900 text-white px-6 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-widest hover:bg-[#8b5cf6] shadow-xl hover:shadow-[#8b5cf6]/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                        >
                            {isSubmitting ? <span className="animate-pulse">Deploying...</span> : (
                                <>
                                    Create Agent <Sparkles className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default CreateAppModal;
