import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Lock, Eye, EyeOff, Loader, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await axios.post(`http://localhost:8080/api/auth/reset-password/${token}`, {
                password,
                confirmPassword
            });
            setMessage(response.data.message);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#fce7f3]">
            {/* Background Dreamy Orbs */}
            <div className="fixed inset-0 -z-10 bg-transparent">
                <div className="absolute top-[20%] left-[10%] w-[60%] h-[60%] rounded-full bg-purple-200/40 blur-[120px] animate-orb-float-1"></div>
                <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[120px] animate-orb-float-2"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-24 h-24 bg-white/40 backdrop-blur-xl rounded-[32px] shadow-glass border border-white/60 mb-8 mx-auto group hover:rotate-12 transition-transform duration-500 ring-4 ring-white/20"
                    >
                        <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/20">
                            <RefreshCw className="w-7 h-7" />
                        </div>
                    </motion.div>

                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">Reset <span className="text-[#8b5cf6]">Access.</span></h2>
                    <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] opacity-70">Define New Security Protocol</p>
                </div>

                {/* Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/40 backdrop-blur-3xl p-10 rounded-[48px] border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group"
                >
                    {/* Subtle Glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                    {message && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mb-8 p-5 rounded-3xl bg-emerald-50/50 border border-emerald-100/50 flex items-center gap-4 text-emerald-600 text-[11px] font-black uppercase tracking-wider"
                        >
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            {message}
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mb-8 p-5 rounded-3xl bg-red-50/50 border border-red-100/50 flex items-center gap-4 text-red-600 text-[11px] font-black uppercase tracking-wider"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            {error}
                        </motion.div>
                    )}


                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">
                                New Token
                            </label>
                            <div className="relative group/input">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-[#8b5cf6] transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/60 border border-white/80 rounded-[24px] py-5 pl-16 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 shadow-sm transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8b5cf6] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">
                                Verify Token
                            </label>
                            <div className="relative group/input">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-[#8b5cf6] transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/60 border border-white/80 rounded-[24px] py-5 pl-16 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 shadow-sm transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] hover:from-[#c026d3] hover:to-[#7c3aed] text-white rounded-[24px] font-black text-[14px] uppercase tracking-widest shadow-[0_15px_30px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(168,85,247,0.5)] transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <> <RefreshCw size={18} /> Update Security </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
