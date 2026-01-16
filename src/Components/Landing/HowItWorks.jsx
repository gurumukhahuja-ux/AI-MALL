import React, { useRef, useEffect } from 'react';
import { Search, Zap, BarChart2, Layers } from 'lucide-react';

const steps = [
    { id: 1, title: '1. Browse', desc: 'Find tools at our market items resources', icon: <Search size={28} /> },
    { id: 2, title: '2. Integrate', desc: 'Connect via seamless integration instantly', icon: <Layers size={28} /> },
    { id: 3, title: '3. Deploy', desc: 'View tensor market relay start resources', icon: <Zap size={28} /> },
    { id: 4, title: '4. Scale', desc: 'New workflows automation hidden services', icon: <BarChart2 size={28} /> },
];

const HowItWorks = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('opacity-0', 'translate-y-12');
                        entry.target.classList.add('opacity-100', 'translate-y-0');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        const cards = containerRef.current.querySelectorAll('.step-card');
        cards.forEach((card) => observer.observe(card));

        return () => observer.disconnect();
    }, []);

    return (
        <section id="how-it-works" ref={containerRef} className="py-12 md:py-20 pb-20 md:pb-32 relative overflow-hidden">
            {/* Background Blob for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-16 relative z-10">
                <h2 className="text-3xl font-bold mb-12 text-[#1A1A1A] text-center">How It Works</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            style={{ transitionDelay: `${index * 150}ms` }}
                            className="step-card opacity-0 translate-y-12 group bg-white/30 backdrop-blur-xl border border-white/60 rounded-[30px] py-10 px-8 flex flex-col items-center text-center transition-all duration-700 ease-out shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:bg-white/50 hover:shadow-[0_20px_40px_-10px_rgba(168,85,247,0.15)] hover:-translate-y-2 cursor-pointer"
                        >
                            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-blue-50 to-purple-50 group-hover:from-blue-100 group-hover:to-purple-100 text-[#3B82F6] group-hover:text-[#8B5CF6] flex items-center justify-center mb-6 shadow-sm transition-colors duration-500">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-[#1A1A1A]">{step.title}</h3>
                            <p className="text-sm text-[#666] leading-relaxed font-medium">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
