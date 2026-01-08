import React from 'react';
import { ArrowRight, Link } from 'lucide-react';

const CTA = () => {

    return (
        <section className="py-24 relative overflow-hidden flex justify-center items-center">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-[100px] -z-10"></div>

            <div className="container relative z-10 px-4">
                <div className="max-w-3xl mx-auto bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[50px] px-12 py-10 md:py-16 md:px-20 text-center shadow-[0_20px_60px_-15px_rgba(168,85,247,0.15)] flex flex-col items-center">

                    <h2 className="text-5xl md:text-6xl font-black mb-8 text-[#1A1A1A] leading-tight tracking-tight">
                        Ready to Transform Your <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1A1A1A] to-[#4B5563]">Business?</span>
                    </h2>

                    <p className="text-xl text-gray-600 mb-16 max-w-xl mx-auto leading-relaxed font-medium">
                        Join thousands of developers and companies building the future with AI-MALL's intelligent agent marketplace.
                    </p>

                    <a href='https://ai-mall.onrender.com'
                        className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-bold text-lg shadow-[0_15px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_25px_40px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center gap-3">
                        Get Started Now <ArrowRight size={22} />
                    </a>

                </div>
            </div>
        </section>
    );
};

export default CTA;
