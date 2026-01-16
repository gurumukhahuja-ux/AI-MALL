import React from 'react';
import { useNavigate } from 'react-router';
import { Bot, User, Zap, ArrowRight, UserCircle } from 'lucide-react';

const Series = () => {
    const navigate = useNavigate();
    const Logo = "/logo/Logo.png";

    return (
        <div className="min-h-screen bg-white relative overflow-hidden font-sans">
            {/* Header */}
            <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10 px-8 lg:px-16">
                <div className="flex items-center gap-2">
                    <img src={Logo} alt="AI Mall Logo" className="w-8 h-8 object-contain" />
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">AI-MALL</span>
                </div>
                <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors">
                    <UserCircle className="w-8 h-8" strokeWidth={1.5} />
                </button>
            </header>

            {/* Main Content */}
            <main className="relative z-0 flex flex-col items-center justify-center min-h-screen text-center px-4 max-w-5xl mx-auto pt-20">

                {/* Badge */}
                <div className="mb-10 animate-fade-in-up">
                    <span className="px-5 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium tracking-wide">
                        Powered by UWO
                    </span>
                </div>

                {/* Headline */}
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[1.1] mb-8 max-w-4xl animate-fade-in-up delay-100">
                    The Future of <br />
                    <span className="text-[#2563eb]">Conversational AI</span>
                </h1>

                {/* Subheadline */}
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-200">
                    Experience the next generation of intelligent assistance. AI-MALL learns, adapts, and creates with you in real-time through a stunning interface.
                </p>

                {/* CTA Button */}
                <div className="animate-fade-in-up delay-300">
                    <button
                        onClick={() => window.location.href = 'https://ai-mall.onrender.com/dashboard/chat'}
                        className="group relative px-10 py-5 bg-[#2563eb] text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-600/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        <div className="relative z-10 flex items-center gap-2">
                            Start Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                </div>
            </main>

            {/* Footer Stats */}
            <div className="absolute bottom-0 w-full bg-white border-t border-gray-100/50 py-12 px-8 lg:px-16 animate-fade-in-up delay-300">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">

                    {/* Stat Items */}
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <div className="text-2xl font-black text-gray-900">100+</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Agents</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                            <User className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <div className="text-2xl font-black text-gray-900">10k+</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Happy Users</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <div className="text-2xl font-black text-gray-900">&lt;50ms</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fast Inference</div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-white">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-50/60 rounded-full blur-[100px]" />
            </div>
        </div>
    );
};

export default Series;
