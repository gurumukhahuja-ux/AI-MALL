import React from 'react';
import { Play, Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveDemoCard = ({ agent, onSubscribe, onWatch }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-[32px] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.15)] transition-all duration-300 flex flex-col h-full"
        >
            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img
                    src={agent.thumbnail}
                    alt={agent.agentName}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />

                {/* Duration Badge */}
                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{agent.duration}</span>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={() => onWatch(agent)}
                        className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:scale-110 transition-transform group/play"
                    >
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#8b5cf6] shadow-lg">
                            <Play className="w-5 h-5 ml-1 fill-current" />
                        </div>
                    </button>
                </div>

                {/* Agent Avatar overlay */}
                <div className="absolute -bottom-6 left-6 z-20">
                    <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg">
                        <img src={agent.avatar} alt="Avatar" className="w-full h-full rounded-xl object-cover" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest mb-1 block">{agent.category}</span>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight line-clamp-2 min-h-[3rem]">
                            {agent.agentName}
                        </h3>
                    </div>
                </div>

                <p className="text-sm font-medium text-gray-500 line-clamp-3 mb-6 flex-1">
                    {agent.description}
                </p>

                {/* Features Preview */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {agent.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-white/50 border border-white rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto">
                    <button
                        onClick={() => onWatch(agent)}
                        className="flex-1 py-3 rounded-[20px] border border-gray-200 bg-white/50 text-xs font-black uppercase tracking-wider text-gray-600 hover:bg-white hover:text-gray-900 transition-colors"
                    >
                        Watch Demo
                    </button>
                    <button
                        onClick={() => onSubscribe(agent._id)}
                        className="flex-1 py-3 rounded-[20px] bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Subscribe
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default LiveDemoCard;
