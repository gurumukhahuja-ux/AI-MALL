import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, Building2, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import apiService from '../services/apiService';

const VendorRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        vendorName: '',
        email: '',
        companyName: '',
        companyType: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const companyTypes = ['Startup', 'SME', 'Enterprise', 'Individual / Freelancer'];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.vendorName.trim()) newErrors.vendorName = 'Vendor name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.companyType) newErrors.companyType = 'Company type is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            await apiService.registerVendor({
                vendorName: formData.vendorName,
                email: formData.email,
                companyName: formData.companyName,
                companyType: formData.companyType,
                password: formData.password
            });
            setSuccess(true);
        } catch (error) {
            setErrors({ submit: error.response?.data?.message || 'Registration failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#fce7f3] flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[48px] p-12 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Registration Submitted!</h2>
                    <p className="text-slate-600 font-medium mb-8">
                        Your vendor registration has been submitted for admin approval. You will receive an email notification once your application is reviewed.
                    </p>
                    <Link
                        to="/vendor-login"
                        className="inline-block px-8 py-4 bg-[#8b5cf6] text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all shadow-lg shadow-[#8b5cf6]/20"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#fce7f3] flex items-center justify-center p-6">
            {/* Background Orbs */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[120px]"></div>
                <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-pink-200/20 blur-[100px]"></div>
            </div>

            <div className="w-full max-w-2xl bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[48px] p-12 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                        Become a <span className="text-[#8b5cf6]">Vendor</span>
                    </h1>
                    <p className="text-slate-600 font-medium">Join AI Mall and start selling your AI applications</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Vendor Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                                Vendor Name
                            </label>
                            <div className="relative">
                                <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    name="vendorName"
                                    value={formData.vendorName}
                                    onChange={handleChange}
                                    className={`w-full bg-white/60 border ${errors.vendorName ? 'border-red-300' : 'border-white/80'} rounded-[24px] pl-12 pr-4 py-4 text-sm outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all font-medium`}
                                    placeholder="Your full name"
                                />
                            </div>
                            {errors.vendorName && <p className="text-xs text-red-500 mt-2 ml-2">{errors.vendorName}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full bg-white/60 border ${errors.email ? 'border-red-300' : 'border-white/80'} rounded-[24px] pl-12 pr-4 py-4 text-sm outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all font-medium`}
                                    placeholder="vendor@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 mt-2 ml-2">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Company Name & Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                                Company Name
                            </label>
                            <div className="relative">
                                <Building2 className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className={`w-full bg-white/60 border ${errors.companyName ? 'border-red-300' : 'border-white/80'} rounded-[24px] pl-12 pr-4 py-4 text-sm outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all font-medium`}
                                    placeholder="Your company"
                                />
                            </div>
                            {errors.companyName && <p className="text-xs text-red-500 mt-2 ml-2">{errors.companyName}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                                Company Type
                            </label>
                            <select
                                name="companyType"
                                value={formData.companyType}
                                onChange={handleChange}
                                className={`w-full bg-white/60 border ${errors.companyType ? 'border-red-300' : 'border-white/80'} rounded-[24px] px-4 py-4 text-sm outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all font-medium`}
                            >
                                <option value="">Select type</option>
                                {companyTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {errors.companyType && <p className="text-xs text-red-500 mt-2 ml-2">{errors.companyType}</p>}
                        </div>
                    </div>

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full bg-white/60 border ${errors.password ? 'border-red-300' : 'border-white/80'} rounded-[24px] pl-12 pr-4 py-4 text-sm outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all font-medium`}
                                    placeholder="Min. 8 characters"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-2 ml-2">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full bg-white/60 border ${errors.confirmPassword ? 'border-red-300' : 'border-white/80'} rounded-[24px] pl-12 pr-4 py-4 text-sm outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all font-medium`}
                                    placeholder="Re-enter password"
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-500 mt-2 ml-2">{errors.confirmPassword}</p>}
                        </div>
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 font-medium">{errors.submit}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#8b5cf6] text-white py-4 rounded-full text-sm font-black uppercase tracking-widest hover:bg-[#7c3aed] transition-all shadow-lg shadow-[#8b5cf6]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit for Approval'
                        )}
                    </button>

                    {/* Login Link */}
                    <p className="text-center text-sm text-slate-600 font-medium">
                        Already registered?{' '}
                        <Link to="/vendor-login" className="text-[#8b5cf6] font-bold hover:underline">
                            Login here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default VendorRegister;
