import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, CheckCircle, Loader2, ChevronDown, Check } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import PricingConfigModal from './PricingConfigModal';

// Custom Dropdown Component
const CustomSelect = ({ label, name, value, options, onChange, placeholder = "Select option" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label || value || placeholder;

    return (
        <div className="space-y-3" ref={containerRef}>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full bg-white/40 border border-white/60 rounded-2xl py-4 px-5 text-left flex items-center justify-between transition-all shadow-sm ${isOpen ? 'ring-4 ring-purple-500/10 border-purple-400 bg-white' : 'hover:bg-white hover:border-purple-300'}`}
                >
                    <span className={`block truncate text-sm font-bold tracking-tight ${!value ? 'text-gray-300' : 'text-gray-900'}`}>
                        {selectedLabel}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-600' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-[100] w-full mt-3 bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[24px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-2 space-y-1">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${value === option.value
                                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                        : 'text-gray-500 hover:bg-white hover:text-purple-600'
                                        }`}
                                >
                                    <span>{option.label}</span>
                                    {value === option.value && <Check className="w-4 h-4" strokeWidth={4} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const NewAppModal = ({ isOpen, onClose, onAppCreated }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        agentName: '',
        description: '',
        url: '',
        category: 'Business OS',
        pricingModel: 'free',
        supportEmail: '',
        avatar: null
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [pricingConfig, setPricingConfig] = useState(null);

    const categories = [
        { value: 'Business OS', label: 'Business OS' },
        { value: 'Data & Intelligence', label: 'Data & Intelligence' },
        { value: 'Sales & Marketing', label: 'Sales & Marketing' },
        { value: 'HR & Finance', label: 'HR & Finance' },
        { value: 'Design & Creative', label: 'Design & Creative' },
        { value: 'Medical & Health AI', label: 'Medical & Health AI' }
    ];

    const pricingModels = [
        { value: 'free', label: 'Free' },
        { value: 'freemium', label: 'Freemium' },
        { value: 'paid', label: 'Paid Only' }
    ];

    const fileInputRef = useRef(null);

    // Body Scroll Lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File size too large. Max 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                // Accept any aspect ratio - will be displayed with object-fit in 4:7 container
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submit button clicked! formData:", formData);
        setMessage('');
        setError(false);
        setLoading(true);

        // Validation: Only Admins can use "TM" in the name
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isAdmin = (user.email || "").includes("admin") || (user.email || "").includes("@ai-mall");
        const hasReservedKeyword = (formData.agentName || "").includes("TM") || (formData.agentName || "").includes("™");

        if (hasReservedKeyword && !isAdmin) {
            setError(true);
            setMessage("Only Admins can use the 'TM' suffix (ASeries reserved).");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const storedUserId = localStorage.getItem('userId');

            // Robust ID retrieval: check user.id, user._id, or separate userId
            let userId = user.id || user._id || storedUserId;

            // Fallback: Try to decode token if ID is missing but token exists
            if (!userId && token) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    const decoded = JSON.parse(jsonPayload);
                    if (decoded && decoded.id) {
                        userId = decoded.id;
                        // Optional: Repair localStorage
                        localStorage.setItem('userId', userId);
                    }
                } catch (e) {
                    console.error("Failed to decode token for ID recovery", e);
                }
            }

            if (!userId) {
                throw new Error("User ID not found. Please log out and log in again.");
            }

            const payload = {
                ...formData,
                vendorId: userId,
                status: 'Draft',
                health: 'All Good',
                pricingConfig: pricingConfig
            };

            const response = await axios.post('http://localhost:8080/api/agents', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setError(false);
            setMessage('App created successfully!');

            // Call parent callback to refresh app list
            if (onAppCreated) {
                onAppCreated(response.data);
            }

            // Redirect to App Detail page immediately
            setTimeout(() => {
                onClose();
                navigate(`/vendor/apps/${response.data._id}`);
                // Reset form
                setFormData({
                    agentName: '',
                    description: '',
                    url: '',
                    category: 'Business OS',
                    pricingModel: 'free',
                    supportEmail: '',
                    avatar: null
                });
                setMessage(null);
            }, 500);

        } catch (err) {
            console.error('App Creation Error:', err);
            setError(true);

            let errorMessage = 'Failed to create app. Please try again.';
            if (err.response) {
                // Server responded with a status code outside 2xx
                const detailedError = err.response.data?.details || '';
                const mainError = err.response.data?.error || errorMessage;
                errorMessage = detailedError ? `${mainError} (${detailedError})` : mainError;
            } else if (err.request) {
                // Request was made but no response received
                errorMessage = "Network Error: No response from server. Check if backend is running.";
            } else {
                // Error setting up the request
                errorMessage = err.message;
            }

            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
            {/* Background Decorative Blobs */}
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[180px] pointer-events-none animate-pulse duration-[10s]" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[180px] pointer-events-none animate-pulse duration-[8s]" />

            <div className="bg-white/70 backdrop-blur-3xl border border-white/40 rounded-[48px] max-w-2xl w-full my-auto shadow-[0_45px_120px_-20px_rgba(0,0,0,0.35)] animate-in zoom-in-95 duration-500 relative flex flex-col overflow-hidden">

                {/* Header Section - Premium Glassmorphic */}
                <div className="px-10 py-10 border-b border-white/30 flex items-center justify-between sticky top-0 bg-white/20 backdrop-blur-2xl z-20">
                    <div className="flex items-center space-x-7">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] blur-[30px] opacity-50 animate-pulse" />
                            <div className="relative p-5 bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] rounded-[28px] shadow-[0_12px_40px_-8px_rgba(139,92,246,0.5)] ring-4 ring-white/70 flex items-center justify-center transition-transform hover:scale-110 duration-500">
                                <Sparkles className="w-10 h-10 text-white drop-shadow-md" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none mb-2">Create New <span className="text-[#8b5cf6]">Agent</span></h2>
                            <p className="text-xs md:text-sm font-bold text-gray-600 tracking-tight opacity-90">Deploy automated intelligence to the AI Mall marketplace</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-4 hover:bg-white/40 rounded-2xl transition-all duration-300 hover:rotate-90 group active:scale-90"
                    >
                        <X className="w-7 h-7 text-gray-500 group-hover:text-gray-900" />
                    </button>
                </div>

                {/* Body - Logical Sections in Glass Cards */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="px-10 py-10 space-y-12">

                        {/* Success/Error Message */}
                        {message && (
                            <div className={`p-6 rounded-[28px] flex items-center gap-5 animate-in slide-in-from-top-4 duration-500 shadow-2xl border-2 backdrop-blur-xl ${error
                                ? 'bg-red-500/10 border-red-200/50 text-red-700'
                                : 'bg-emerald-500/10 border-emerald-200/50 text-emerald-700'
                                }`}>
                                {error ? <AlertCircle className="w-7 h-7 shrink-0" /> : <CheckCircle className="w-7 h-7 shrink-0" />}
                                <span className="font-black text-sm uppercase tracking-wider">{message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-12">

                            {/* Section 1: Agent Profile Glass Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ y: -4, shadow: "0 20px 40px rgba(139, 92, 246, 0.08)" }}
                                className="space-y-8 bg-white/40 backdrop-blur-md p-9 rounded-[40px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:border-purple-200/50 transition-all duration-500 group relative"
                            >
                                <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                <div className="space-y-5 relative">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-5 bg-[#8b5cf6] rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
                                        <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#8b5cf6]/70">Agent Profile</h3>
                                    </div>

                                    {/* Agent Name */}
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.15em] ml-1">
                                            Agent Name <span className="text-purple-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="agentName"
                                            value={formData.agentName}
                                            onChange={handleChange}
                                            placeholder="e.g., AI Content Strategist"
                                            className="w-full bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-2xl py-5 px-6 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-8 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white transition-all font-bold text-lg tracking-tight shadow-sm"
                                            required
                                        />
                                    </div>

                                    {/* Agent Description */}
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.15em] ml-1">
                                            Agent Description <span className="text-purple-500">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe what your agent does, its capabilities, and use cases"
                                            rows={5}
                                            className="w-full bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-2xl py-5 px-6 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-8 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white transition-all resize-none font-bold tracking-tight shadow-sm"
                                            required
                                        />
                                        <p className="text-[10px] font-bold text-gray-500 ml-1 leading-relaxed italic opacity-80">
                                            Provide deep context about your agent's primary functions and specialized expertise.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Section 2: Core Configuration Glass Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ y: -4, shadow: "0 20px 40px rgba(139, 92, 246, 0.08)" }}
                                className="space-y-8 bg-white/40 backdrop-blur-md p-9 rounded-[40px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:border-purple-200/50 transition-all duration-500 group relative"
                            >
                                <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                <div className="space-y-5 relative">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-5 bg-[#8b5cf6] rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
                                        <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#8b5cf6]/70">Core Configuration</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                                        {/* Category Selection */}
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.15em] ml-1">
                                                Agent Category <span className="text-purple-500">*</span>
                                            </label>
                                            <CustomSelect
                                                name="category"
                                                value={formData.category}
                                                options={categories}
                                                onChange={handleChange}
                                                placeholder="Select Category"
                                            />
                                        </div>

                                        {/* Monetization / Pricing */}
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.15em] ml-1">
                                                Subscription Model
                                            </label>
                                            <motion.button
                                                type="button"
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setIsPricingModalOpen(true)}
                                                className={`w-full relative overflow-hidden rounded-[22px] transition-all duration-500 group h-[60px] border-2 shadow-sm ${pricingConfig
                                                    ? 'bg-purple-100/40 border-purple-200 backdrop-blur-sm'
                                                    : 'bg-gray-900 border-gray-800 hover:bg-black hover:shadow-[0_15px_30px_-5px_rgba(139,92,246,0.3)]'
                                                    }`}
                                            >
                                                <div className="relative h-full px-5 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-1.5 rounded-lg transition-all ${pricingConfig ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-white/10 text-white backdrop-blur-md group-hover:scale-110'}`}>
                                                            {pricingConfig ? <Check size={18} strokeWidth={4} /> : <Sparkles size={18} className="animate-pulse" />}
                                                        </div>
                                                        <div className="text-left">
                                                            <span className={`block text-[13px] font-black tracking-tight ${pricingConfig ? 'text-purple-800' : 'text-white'}`}>
                                                                {pricingConfig ? 'Pricing Active' : 'Enter Price'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronDown size={16} className={`transition-all ${pricingConfig ? 'text-purple-600' : 'text-gray-500 group-hover:text-white group-hover:translate-x-1'} -rotate-90`} />
                                                </div>
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Agent Live URL */}
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.15em] ml-1">
                                            Agent Live URL
                                        </label>
                                        <input
                                            type="url"
                                            name="url"
                                            value={formData.url}
                                            onChange={handleChange}
                                            placeholder="https://your-agent.api"
                                            className="w-full bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-2xl py-4.5 px-6 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-8 focus:ring-purple-500/10 focus:border-purple-400 focus:bg-white transition-all font-bold text-lg tracking-tight shadow-sm"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Section 3: Visual Identity & Logo Glass Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ y: -4, shadow: "0 20px 40px rgba(139, 92, 246, 0.08)" }}
                                className="space-y-8 bg-white/40 backdrop-blur-md p-9 rounded-[40px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:border-purple-200/50 transition-all duration-500 group mb-10 relative"
                            >
                                <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                <div className="space-y-6 relative">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-5 bg-[#8b5cf6] rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
                                        <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#8b5cf6]/70">Visual Identity</h3>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
                                        {/* Avatar Upload Container */}
                                        <div className="relative group shrink-0">
                                            <motion.div
                                                onClick={() => fileInputRef.current?.click()}
                                                whileHover={{ scale: 1.02, shadow: "0 25px 50px -12px rgba(139, 92, 246, 0.25)" }}
                                                className="w-[140px] h-[200px] bg-white/60 backdrop-blur-sm border-2 border-white/50 border-dashed rounded-[36px] flex items-center justify-center cursor-pointer hover:bg-white hover:border-purple-300 transition-all duration-500 overflow-hidden shadow-sm active:scale-95"
                                            >
                                                {formData.avatar ? (
                                                    <img src={formData.avatar} alt="Icon" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                                        <div className="p-5 bg-purple-500/10 rounded-2xl mb-4 text-[#8b5cf6] group-hover:bg-[#8b5cf6] group-hover:text-white transition-all duration-500 backdrop-blur-sm shadow-sm">
                                                            <Loader2 size={28} className="animate-spin-slow" />
                                                        </div>
                                                        <div className="text-[10px] font-black text-gray-500 group-hover:text-[#8b5cf6] tracking-widest uppercase">Upload Logo</div>
                                                    </div>
                                                )}
                                            </motion.div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            {formData.avatar && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFormData({ ...formData, avatar: null });
                                                    }}
                                                    className="absolute -top-4 -right-4 p-3 bg-red-500 text-white rounded-full hover:bg-black shadow-2xl shadow-red-500/40 transition-all hover:scale-110 z-10"
                                                >
                                                    <X size={16} strokeWidth={3} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-5 pt-3">
                                            <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">Agent Avatar</h4>
                                            <p className="text-xs text-gray-600 font-bold leading-relaxed tracking-tight group-hover:text-gray-800 transition-colors">
                                                Provide a visual representation for your agent. Recommended size: <span className="text-[#8b5cf6] font-black underline decoration-2 underline-offset-4">800x1200px</span>.
                                            </p>
                                            <div className="flex flex-wrap gap-3 pt-2">
                                                {["Minimalist", "PNG/JPG", "Max 5MB"].map(tag => (
                                                    <span key={tag} className="px-4 py-1.5 bg-white/60 backdrop-blur-sm border border-white/50 rounded-full text-[10px] font-black text-gray-600 uppercase tracking-widest shadow-sm hover:border-[#8b5cf6]/30 transition-colors">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </form>
                    </div>
                </div>

                {/* Sticky Action Footer - Enhanced CTA */}
                <div className="p-10 bg-white/40 backdrop-blur-3xl border-t border-white/40 flex items-center justify-between gap-8 z-20 shadow-[0_-25px_60px_rgba(0,0,0,0.03)] sm:flex-row flex-col-reverse">
                    <motion.button
                        type="button"
                        whileHover={{ x: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-500 hover:text-gray-900 transition-all active:scale-95 flex items-center gap-2 group"
                    >
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full group-hover:bg-gray-900 transition-colors" />
                        Cancel
                    </motion.button>
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02, y: -2, shadow: "0 25px 50px -12px rgba(124, 58, 237, 0.6)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={loading || !formData.agentName || !formData.description}
                        className={`px-16 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 flex items-center gap-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto w-full justify-center ${pricingConfig?.selectedPlans?.length > 0 || formData.agentName
                            ? 'bg-gradient-to-r from-[#7c3aed] to-[#c026d3] text-white shadow-[0_20px_40px_-10px_rgba(124,58,237,0.5)]'
                            : 'bg-white/30 border-2 border-white/50 text-gray-400 backdrop-blur-md shadow-inner'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Initializing...
                            </>
                        ) : (
                            <>
                                Create Agent
                                <Check size={18} strokeWidth={4} className="drop-shadow-sm" />
                            </>
                        )}
                    </motion.button>
                </div>
            </div>

            <PricingConfigModal
                isOpen={isPricingModalOpen}
                onClose={() => setIsPricingModalOpen(false)}
                onSave={(data) => {
                    setPricingConfig(data);
                    setFormData({ ...formData, pricingModel: 'subscription' });
                }}
                initialData={pricingConfig}
            />
        </div>
    );
};

export default NewAppModal;
