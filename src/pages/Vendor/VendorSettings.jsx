import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Building2, Save, Camera, ShieldCheck, Grip, FileCode2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';

const VendorSettings = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        companyType: 'Individual',
        avatar: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setFormData({
            name: user.name || '',
            email: user.email || '',
            companyName: user.companyName || '',
            companyType: user.companyType || 'Individual',
            avatar: user.avatar || ''
        });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Dispatch event to update layout
            window.dispatchEvent(new Event('vendorProfileUpdate'));

            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">Profile <span className="text-[#8b5cf6]">Setting.</span></h1>
                    <p className="text-gray-500 font-bold text-lg tracking-tight max-w-xl">Manage your vendor profile and account details.</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] overflow-hidden"
            >
                {/* Visual Header Background */}
                <div className="h-40 bg-gradient-to-r from-gray-900 via-[#1f1f2e] to-gray-900 relative">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-[#8b5cf6]/20 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.3),transparent_40%)]" />
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#d946ef]/20 to-transparent" />
                </div>

                <div className="px-10 pb-10">
                    {/* Avatar Section */}
                    <div className="relative -mt-16 mb-12 flex items-end">
                        <div className="relative group">
                            <div className={`w-32 h-32 rounded-[28px] p-1.5 ${formData.avatar ? 'bg-white' : 'bg-white/20 backdrop-blur-md'} border border-white/40 shadow-2xl transition-all`}>
                                <div className={`w-full h-full ${formData.avatar ? 'bg-white' : 'bg-gradient-to-br from-gray-100 to-white'} rounded-[22px] flex items-center justify-center text-4xl font-black text-gray-400 border border-white/60 overflow-hidden relative transition-all`}>
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        formData.name ? formData.name.charAt(0).toUpperCase() : <User size={40} />
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300 drop-shadow-lg" />
                                    </div>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/png, image/jpeg, image/jpg"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={triggerFileInput}
                                className="absolute bottom-0 -right-2 p-2.5 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-900/40 hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white"
                                title="Update Vendor Identity"
                            >
                                <Camera size={14} />
                            </button>
                        </div>
                        <div className="ml-6 mb-3">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{formData.name || 'Unknown Vendor'}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-100/50 border border-emerald-200 text-[#059669] text-[10px] font-black uppercase tracking-wider gap-1">
                                    <ShieldCheck size={12} fill="currentColor" className="text-emerald-100" strokeWidth={2.5} />
                                    Verified Vendor
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                    ID: V-{Math.floor(Math.random() * 10000)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <form className="max-w-4xl space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

                            {/* Section: Operator Identity */}
                            <div className="space-y-6">
                                <h4 className="flex items-center gap-2 text-xs font-black text-[#8b5cf6] uppercase tracking-widest mb-4">
                                    <User size={14} /> Vendor Identity
                                </h4>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Vendor Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-white/60 rounded-[20px] text-gray-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] transition-all placeholder-gray-400 shadow-sm"
                                            placeholder="Vendor Name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Vendor's Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-white/60 rounded-[20px] text-gray-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] transition-all placeholder-gray-400 shadow-sm"
                                            placeholder="admin@network.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Entity Details */}
                            <div className="space-y-6">
                                <h4 className="flex items-center gap-2 text-xs font-black text-[#d946ef] uppercase tracking-widest mb-4">
                                    <Building2 size={14} /> Company Details
                                </h4>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Company Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-[#d946ef] transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-white/60 rounded-[20px] text-gray-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#d946ef]/20 focus:border-[#d946ef] transition-all placeholder-gray-400 shadow-sm"
                                            placeholder="Company Name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Company Type</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Grip className="h-5 w-5 text-gray-400 group-focus-within:text-[#d946ef] transition-colors" />
                                        </div>
                                        <select
                                            name="companyType"
                                            value={formData.companyType}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-white/60 rounded-[20px] text-gray-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#d946ef]/20 focus:border-[#d946ef] transition-all appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="Individual">Individual Vendor</option>
                                            <option value="Startup">Startup Collective</option>
                                            <option value="Enterprise">Enterprise Node</option>
                                            <option value="Agency">Development Agency</option>
                                            <option value="Other">Other Company</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-8 border-t border-white/60 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isLoading}
                                className="bg-[#8b5cf6] text-white px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/30 active:scale-95 flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group border-2 border-[#7c3aed]"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="group-hover:scale-110 transition-transform" />
                                        Save Configuration
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default VendorSettings;
