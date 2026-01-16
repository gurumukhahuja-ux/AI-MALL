import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Cpu, Mail, Lock, User, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiService } from '../services/apiService';
import { AppRoute, apis } from '../types';
import axios from 'axios';
import { setUserData } from '../userStore/userData.js';
import { logo } from '../constants';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const payLoad = { name, email, password }
  const handleSubmit = (e) => {
    setIsLoading(true)
    e.preventDefault();
    axios.post(apis.signUp, payLoad).then((res) => {
      setUserData(res.data)
      navigate(AppRoute.E_Verification);
    }).catch((err) => {
      console.log(err);
      setError(err.response.data.error)
    }).finally(() => {
      setIsLoading(false)
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#fce7f3]">

      {/* Background Dreamy Orbs */}
      <div className="fixed inset-0 -z-10 bg-transparent">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-200/40 blur-[120px] animate-orb-float-1"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-200/40 blur-[120px] animate-orb-float-2"></div>
      </div>

      <div className="relative z-10 w-full max-w-md my-10">

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-white/40 backdrop-blur-xl rounded-[32px] shadow-glass border border-white/60 mb-8 mx-auto group hover:rotate-12 transition-transform duration-500 ring-4 ring-white/20"
          >
            <img src="/logo/Logo.png" alt="AI Mall Logo" className="w-20 h-20 object-contain drop-shadow-md" />
          </motion.div>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">Create <span className="text-[#8b5cf6]">Account.</span></h2>
          <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] opacity-70">Initialize Neural Identity</p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/40 backdrop-blur-3xl p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group"
        >
          {/* Subtle Glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

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

            {/* Name */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Full Name</label>
              <div className="relative group/input">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-[#8b5cf6] transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/60 border border-white/80 rounded-[24px] py-5 pl-16 pr-8 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 shadow-sm transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Email Address</label>
              <div className="relative group/input">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-[#8b5cf6] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/60 border border-white/80 rounded-[24px] py-5 pl-16 pr-8 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 shadow-sm transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-2">Password</label>
              <div className="relative group/input">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-[#8b5cf6] transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/60 border border-white/80 rounded-[24px] py-5 pl-16 pr-8 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 shadow-sm transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-[24px] font-black text-[14px] uppercase tracking-widest shadow-[0_15px_30px_-5px_rgba(59,130,246,0.5)] hover:shadow-[0_20px_40px_-5px_rgba(59,130,246,0.6)] transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <> <Sparkles size={18} /> Sign Up </>
              )}
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="mt-12 text-center relative z-10">
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-6 opacity-60">Already registered?</p>
            <Link to="/login" className="inline-block px-10 py-4 bg-gray-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-black transition-all transform hover:scale-105 active:scale-95 shadow-lg">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Back Home */}
        <Link
          to="/"
          className="mt-12 flex items-center justify-center gap-3 text-gray-400 hover:text-gray-900 transition-all font-black text-[10px] uppercase tracking-[0.3em]"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={3} /> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default Signup;
