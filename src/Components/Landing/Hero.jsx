import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AppRoute } from '../../types';

const Hero = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className="py-12 md:py-16 pb-20 md:pb-24 overflow-hidden relative min-h-[500px] md:min-h-[600px] flex items-center">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-gradient-to-b from-purple-200/30 to-blue-200/30 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-16 grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-16 text-center md:text-left">
                <div className="z-10">
                    <h1 className={`text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.15] mb-6 text-[#1A1A1A] transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        Discover & Deploy <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">
                            AI Solutions
                        </span>
                    </h1>

                    <p className={`text-lg md:text-xl text-[#555] mb-10 max-w-[90%] mx-auto md:mx-0 font-medium transition-all duration-1000 delay-100 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        Your vendors marketplace for intelligent agents
                    </p>

                    <div className={`flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center md:justify-start transition-all duration-1000 delay-200 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <button
                            onClick={() => navigate('/dashboard/chat')}
                            className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-base text-white bg-[#8b5cf6] hover:bg-[#7c3aed] shadow-lg shadow-purple-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/60 active:scale-95 outline-none focus:ring-4 focus:ring-purple-400/50">
                            AI Mall
                        </button>
                        <button
                            onClick={() => window.location.href = "https://a-series-bgve.onrender.com/dashboard/chat"}
                            className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-base text-white bg-[#3b82f6] hover:bg-[#2563eb] shadow-lg shadow-blue-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/60 active:scale-95 outline-none focus:ring-4 focus:ring-blue-400/50">
                            A Series
                        </button>
                    </div>
                </div>

                <div className={`relative h-[400px] md:h-[500px] flex items-center justify-center perspective-[1000px] transition-all duration-1000 delay-300 ease-out transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                    <div className="relative w-full max-w-[350px] md:max-w-[500px] aspect-square flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                        {/* Dreamy Glass Card */}
                        <div className="glass-card absolute inset-0 md:inset-[40px] bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-3xl rounded-[40px] md:rounded-[50px] border border-white/40 shadow-[0_30px_80px_-20px_rgba(168,85,247,0.25)] flex flex-col items-center justify-center overflow-hidden">

                            {/* Inner Soft Gradient Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 via-purple-400/10 to-pink-400/10 mix-blend-overlay"></div>

                            {/* Floating Orbs - Behind Text */}
                            <div className="orb-1 absolute top-[10%] left-[10%] w-32 h-32 rounded-full mix-blend-multiply filter blur-xl opacity-80"
                                style={{
                                    background: 'radial-gradient(circle at 30% 30%, #67e8f9, #3b82f6)',
                                    transform: 'translateZ(-40px)'
                                }}></div>

                            <div className="orb-2 absolute bottom-[10%] right-[5%] w-40 h-40 rounded-full mix-blend-multiply filter blur-xl opacity-80"
                                style={{
                                    background: 'radial-gradient(circle at 30% 30%, #f472b6, #a855f7)',
                                    transform: 'translateZ(-20px)'
                                }}></div>

                            <div className="orb-3 absolute bottom-[20%] left-[15%] w-28 h-28 rounded-full mix-blend-multiply filter blur-xl opacity-80"
                                style={{
                                    background: 'radial-gradient(circle at 30% 30%, #4ade80, #0ea5e9)',
                                    transform: 'translateZ(-60px)'
                                }}></div>


                            {/* Large Stacked Text */}
                            <div className="relative z-10 flex flex-col items-center justify-center leading-[0.85] animate-zoom">
                                <h2 className="text-[60px] sm:text-[100px] md:text-[140px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-500/80 to-purple-600/80 mix-blend-overlay drop-shadow-lg"
                                    style={{ fontFamily: 'Inter, sans-serif' }}>
                                    AI
                                </h2>
                                <h2 className="text-[60px] sm:text-[100px] md:text-[140px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-t from-purple-600/80 to-pink-500/80 mix-blend-overlay drop-shadow-lg -mt-2 md:-mt-4"
                                    style={{ fontFamily: 'Inter, sans-serif' }}>
                                    MALL
                                </h2>
                            </div>

                            <div className="mt-8 text-sm font-bold text-gray-500/80 uppercase tracking-[0.4em] mix-blend-multiply">
                                Marketplace for AI
                            </div>

                            {/* Foreground Particle */}
                            <div className="particle-1 absolute top-[20%] right-[20%] w-4 h-4 rounded-full bg-cyan-300 blur-sm mix-blend-screen animate-pulse"></div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
