import React, { useEffect, useState } from 'react';
import { Search, Star, Play, X, Info, Send, Terminal, Sparkles, Activity, Zap, ChevronRight, Mail, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { apis, AppRoute } from '../types';
import { getUserData, toggleState } from '../userStore/userData';
import SubscriptionForm from '../Components/SubscriptionForm/SubscriptionForm';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import ContactVendorModal from '../Components/ContactVendorModal';

const Marketplace = () => {
    // --- MOCK DATA FOR PREVIEW (Ensures grid is never empty) ---
    // --- MOCK DATA FOR PREVIEW (Ensures grid is never empty) ---
    const MOCK_AGENTS = [
        {
            _id: 'mock-1',
            agentName: 'AIBOTT',
            category: 'Customer Support',
            description: 'Intelligent conversational agent for 24/7 client engagement and support automation.',
            avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
            status: 'Live',
            reviewStatus: 'Approved',
            rating: 4.9,
            owner: 'mock-owner'
        },
        {
            _id: 'mock-2',
            agentName: 'AIBIZ',
            category: 'Business OS',
            description: 'Comprehensive business intelligence suite for data-driven decision making.',
            avatar: 'https://cdn-icons-png.flaticon.com/512/8649/8649607.png',
            status: 'Live',
            reviewStatus: 'Approved',
            rating: 4.8,
            owner: 'mock-owner'
        },
        {
            _id: 'mock-3',
            agentName: 'AIBASE',
            category: 'Data & Knowledge',
            description: 'Secure enterprise knowledge base with semantic search and retrieval capabilities.',
            avatar: 'https://cdn-icons-png.flaticon.com/512/9626/9626649.png',
            status: 'Live',
            reviewStatus: 'Approved',
            rating: 4.7,
            owner: 'mock-owner'
        }
    ];

    const [agents, setAgents] = useState(MOCK_AGENTS); // Default: Show Mocks immediately
    const [filter, setFilter] = useState('all');
    const [userAgent, setUserAgent] = useState([])
    const [loading, setLoading] = useState(false)
    const [subToggle, setSubToggle] = useRecoilState(toggleState)
    const user = getUserData()
    const [agentId, setAgentId] = useState("")
    const [searchQuery, setSearchQuery] = useState("");
    const [showDemo, setShowDemo] = useState(false)
    const [demoUrl, setDemoUrl] = useState("")
    const [showAgentInfo, setShowAgentInfo] = useState(false)
    const [selectedAgent, setSelectedAgent] = useState(null)
    const [helpForm, setHelpForm] = useState({ subject: '', message: '' })
    const [showContactModal, setShowContactModal] = useState(false)
    const [contactAgent, setContactAgent] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            // Only show loader if we genuinely have no content
            if (agents.length === 0) {
                setLoading(true);
            }
            const userId = user?.id || user?._id;

            try {
                // Fetch agents
                const agentsRes = await axios.get(apis.agents);
                const apiAgents = (agentsRes.data && Array.isArray(agentsRes.data)) ? agentsRes.data : [];

                // Always merge MOCK with real agents to populate the grid visually
                // We prefer real agents, but keep mocks if list is short
                // if (apiAgents.length < 3) {
                //     // Filter out any mocks that might be duplicates if we re-fetch? IDK, just simple merge.
                //     // But we want mocks first? Or real first?
                //     // Let's put REAL agents first, then MOCKS.
                //     setAgents([...apiAgents, ...MOCK_AGENTS]);
                // } else {
                //     setAgents(apiAgents);
                // }
                setAgents(apiAgents);

                if (userId) {
                    try {
                        const userAgentsRes = await axios.post(apis.getUserAgents, { userId });
                        setUserAgent(userAgentsRes.data?.agents || []);
                    } catch (error) {
                        console.error("Error fetching user agents:", error);
                        setUserAgent([]);
                    }
                } else {
                    setUserAgent([]);
                }
            } catch (error) {
                console.error("Error fetching marketplace data:", error);
                // Keep visually populated
                // setAgents(MOCK_AGENTS);
                setAgents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [agentId, user?.id, user?._id, subToggle]);

    const toggleBuy = (id) => {
        if (!user) {
            navigate(AppRoute.LOGIN)
            return
        }
        setSubToggle({ ...subToggle, subscripPgTgl: true })
        setAgentId(id)
    };

    const openAgentInfo = (agent) => {
        setSelectedAgent(agent);
        setShowAgentInfo(true);
        setHelpForm({ subject: '', message: '' });
    };

    const sendHelpQuery = async () => {
        if (!selectedAgent) return;
        const vendorEmail = selectedAgent.supportEmail || selectedAgent.vendorEmail || 'support@ai-mall.in';
        const subject = helpForm.subject;
        const message = helpForm.message;
        try {
            await axios.post('http://localhost:8080/api/support', {
                email: user?.email || 'guest@ai-mall.in',
                senderName: user?.name || 'Guest User',
                issueType: 'UserSupport',
                subject: `[Inquiry] ${selectedAgent.agentName}: ${subject}`,
                message: message,
                userId: selectedAgent.owner
            });
            const mailtoSubject = encodeURIComponent(`Query about ${selectedAgent.agentName} - ${subject}`);
            const body = encodeURIComponent(`Agent: ${selectedAgent.agentName}\nCategory: ${selectedAgent.category}\n\nSubject: ${subject}\n\nMessage:\n${message}`);
            window.location.href = `mailto:${vendorEmail}?subject=${mailtoSubject}&body=${body}`;
            setShowAgentInfo(false);
            setHelpForm({ subject: '', message: '' });
        } catch (error) {
            console.error("Failed to log support inquiry:", error);
            window.location.href = `mailto:${vendorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        }
    };

    // Strict Filter: Only show Live + Approved agents.
    const filteredAgents = agents.filter(agent => {
        // Exclude A-Series Agents (Official)
        const aSeriesNames = [
            'AIBIZ', 'AIBASE', 'AICRAFT', 'AISA', 'AIBOTT',
            'AIGENE', 'AIBRAND', 'AISTREAM', 'AIOFFICE', 'AIDESK', 'AIFLOW'
        ];

        // Strict Requirement: Agent MUST have an owner (vendor or admin)
        if (!agent.owner) return false;

        // Strict Requirement: No mock agents
        if (agent._id?.startsWith('mock-')) return false;

        if (aSeriesNames.includes(agent.agentName?.trim().toUpperCase()) || aSeriesNames.includes(agent.name?.trim().toUpperCase())) {
            return false;
        }

        const matchesCategory = filter === 'all' || agent.category === filter;
        const matchesSearch = (agent.agentName || agent.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (agent.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['all', "Business OS", "Data & Intelligence", "Sales & Marketing", "HR & Finance", "Design & Creative", "Medical & Health AI"];
    // Exclude A-Series from Top Trending too
    // Exclude A-Series from Top Trending
    const topUsedAgents = agents.filter(a => ![
        'AIBIZ', 'AIBASE', 'AICRAFT', 'AISA', 'AIBOTT',
        'AIGENE', 'AIBRAND', 'AISTREAM', 'AIOFFICE', 'AIDESK', 'AIFLOW'
    ].includes(a.agentName?.trim().toUpperCase() || a.name?.trim().toUpperCase())).slice(0, 3);

    // --- ANIMATION VARIANTS ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15, // Staggered reveal
                delayChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50 }, // Start lower for drama
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } // Smooth cubic bezier
        }
    };

    return (
        <div className="flex-1 overflow-y-auto w-full h-full text-slate-800 relative no-scrollbar bg-[#FAFAFA]">
            {/* --- GLOBAL BACKGROUND: Soft Pastel Gradients --- */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-fuchsia-50/30"></div>
                {/* Floating Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[80vmax] h-[80vmax] bg-purple-200/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vmax] h-[60vmax] bg-blue-200/20 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[20%] w-[40vmax] h-[40vmax] bg-pink-200/10 rounded-full blur-[90px]" />
            </div>

            <div className="relative z-10 p-4 md:p-10 lg:p-14 max-w-[1600px] mx-auto">

                <AnimatePresence>
                    {subToggle.subscripPgTgl && <SubscriptionForm id={agentId} />}

                    {/* Modals */}
                    {showDemo && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white/70 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] p-6 md:p-8 w-full max-w-5xl shadow-2xl relative border border-white/80 mx-4"
                            >
                                <button onClick={() => setShowDemo(false)} className="absolute -top-4 -right-4 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform text-gray-800 border border-gray-100"><X className="w-5 h-5" /></button>
                                <div className="aspect-video w-full rounded-[32px] overflow-hidden bg-gray-950 border-4 border-white/40 shadow-inner">
                                    <iframe width="100%" height="100%" src={demoUrl} title="Agent Demo" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {showAgentInfo && selectedAgent && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white/90 backdrop-blur-3xl rounded-[32px] md:rounded-[48px] p-6 md:p-10 w-full max-w-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] relative max-h-[90vh] overflow-y-auto no-scrollbar border border-white mx-4"
                            >
                                <button onClick={() => setShowAgentInfo(false)} className="absolute top-6 right-6 p-3 rounded-full bg-white/50 hover:bg-white text-gray-800 transition-all border border-white shadow-sm"><X className="w-5 h-5" /></button>

                                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                                    <div className="w-32 h-32 rounded-[24px] bg-white p-1.5 shadow-xl overflow-hidden flex-shrink-0 border border-white/60">
                                        <img src={selectedAgent.avatar} alt={selectedAgent.agentName} className="w-full h-full object-cover rounded-[18px]" />
                                    </div>
                                    <div className="text-center md:text-left space-y-3 pt-2">
                                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{selectedAgent.agentName}</h2>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                            <span className="bg-purple-100/50 text-purple-700 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-purple-100">Category: {selectedAgent.category}</span>
                                            <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                <span className="text-xs font-bold text-gray-800">4.9/5.0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-8 bg-white/60 rounded-[32px] border border-white/80 shadow-sm relative overflow-hidden">
                                        <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-3 uppercase tracking-tight"><Sparkles className="w-5 h-5 text-purple-600" />Capabilities</h3>
                                        <p className="text-gray-600 font-medium text-base leading-relaxed">{selectedAgent.description}</p>
                                    </div>

                                    <div className="p-8 bg-gray-900 rounded-[40px] text-white shadow-xl relative overflow-hidden border border-gray-800">
                                        <h3 className="text-2xl font-black mb-2 flex items-center gap-3 tracking-tighter">Support Uplink</h3>
                                        <p className="text-gray-400 text-sm mb-6">Direct channel to vendor engineering.</p>
                                        <div className="space-y-4">
                                            <input type="text" placeholder="Subject" value={helpForm.subject} onChange={(e) => setHelpForm({ ...helpForm, subject: e.target.value })} className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:bg-white/20 transition-all text-sm font-bold" />
                                            <textarea placeholder="Message..." value={helpForm.message} onChange={(e) => setHelpForm({ ...helpForm, message: e.target.value })} rows="3" className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:bg-white/20 transition-all resize-none text-sm font-medium"></textarea>
                                            <button onClick={sendHelpQuery} disabled={!helpForm.subject || !helpForm.message} className="w-full py-4 bg-white text-black rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-purple-400 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2">Send Inquiry <Send className="w-4 h-4 ml-1" /></button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* --- HERO SECTION --- 
                    Refined with floating motion, soft outer glow, and stronger, smoother gradients. 
                */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    whileHover={{ y: -5 }} // Subtle interactive float
                    className="relative w-full min-h-[220px] md:min-h-[380px] mb-8 md:mb-16 rounded-[40px] md:rounded-[48px] overflow-hidden bg-white/30 backdrop-blur-3xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(100,50,255,0.1)] group"
                >
                    {/* Background Gradients & Flow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-purple-50/20 to-blue-50/10 pointer-events-none" />

                    {/* Animated Blobs */}
                    <motion.div
                        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -20, 0] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-[20%] -left-[10%] w-[350px] md:w-[550px] h-[350px] md:h-[550px] bg-purple-300/25 rounded-full blur-[100px] md:blur-[130px] mix-blend-multiply"
                    />
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1.1, 1, 1.1], x: [0, -30, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-[20%] -right-[10%] w-[450px] md:w-[650px] h-[450px] md:h-[650px] bg-blue-300/20 rounded-full blur-[100px] md:blur-[130px] mix-blend-multiply"
                    />

                    <div className="relative z-10 flex flex-col md:flex-row h-full items-center px-6 md:px-20 py-8 md:py-12 gap-8 md:gap-10">
                        {/* Left Content */}
                        <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
                            <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[1.1] md:leading-[0.9] drop-shadow-sm">
                                <span className="block text-gray-900">AI-MALL</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 saturate-[1.2]">MARKETPLACE</span>
                            </h1>

                            <p className="text-sm md:text-lg text-gray-600 font-medium max-w-lg leading-relaxed mx-auto md:mx-0">
                                Deploy enterprise-grade autonomous agents directly into your workflow. The future of decentralized intelligence is here.
                            </p>
                        </div>

                        {/* Right Content - Trending Vitals Card (Micro-animations) */}
                        <div className="hidden md:block w-[360px] relative h-[260px]">
                            <motion.div
                                animate={{ y: [0, -12, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute right-0 top-0 w-full bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-[36px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)]"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                            className="p-2.5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl text-purple-600 border border-purple-100"
                                        >
                                            <Activity className="w-5 h-5" />
                                        </motion.div>
                                        <div>
                                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Top Trending</h3>
                                            <p className="text-[10px] text-gray-500 font-bold">Real-time usage</p>
                                        </div>
                                    </div>
                                    {/* Pulse Dot */}
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75 absolute right-8" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 relative" />
                                </div>

                                <div className="space-y-4">
                                    {topUsedAgents.map((agent, index) => (
                                        <div key={agent._id} className="flex items-center gap-4 p-2 rounded-2xl hover:bg-white/60 transition-colors cursor-default border border-transparent hover:border-white/50">
                                            <img src={agent.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm bg-gray-50" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <h4 className="text-[11px] font-bold text-gray-800 leading-none">{agent.agentName}</h4>
                                                    <span className="text-[9px] font-bold text-gray-400">{92 - index * 3}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${92 - index * 5}%` }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 1.2, delay: 0.1 * index, ease: "easeOut" }}
                                                        className={`h-full rounded-full ${index === 0 ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
                                                            index === 1 ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                                                                'bg-gradient-to-r from-blue-400 to-cyan-400'}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* --- NAVIGATION SECTION --- */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-8 md:mb-12 sticky top-4 z-40 bg-white/25 backdrop-blur-xl p-3 md:pr-4 md:pl-6 rounded-[24px] md:rounded-[30px] border border-white/50 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.03)] selection:bg-purple-200">
                    <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-6 w-full xl:w-auto">
                        <h2 className="hidden md:block text-2xl font-black tracking-tight text-gray-900 whitespace-nowrap">
                            AI Agents
                        </h2>

                        <div className="relative group w-full lg:w-[420px]">
                            <div className="relative bg-white/40 backdrop-blur-md border border-white/50 rounded-full overflow-hidden flex items-center transition-all focus-within:ring-2 focus-within:ring-purple-200 focus-within:bg-white/80 h-12 shadow-inner">
                                <Search className="ml-5 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search intelligence..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 bg-transparent border-none outline-none font-semibold text-sm text-gray-900 placeholder:text-gray-400 h-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex overflow-x-auto md:flex-wrap justify-start md:justify-center xl:justify-end gap-2 md:gap-3 flex-1 w-full md:w-auto no-scrollbar pb-2 md:pb-0 px-2 lg:px-0 scroll-smooth">
                        {categories.map((cat, i) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-5 md:px-6 py-2.5 md:py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap flex-shrink-0 ${filter === cat
                                    ? 'bg-purple-600 text-white border-transparent shadow-lg shadow-purple-200/50 scale-105'
                                    : 'bg-white/40 text-gray-500 border-white/30 hover:bg-white hover:text-purple-600 hover:shadow-md active:scale-95'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- AGENTS GRID (Staggered Scroll-Triggered Reveal) --- */}
                <motion.div
                    variants={containerVariants}
                    initial="visible"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-32"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredAgents.map((agent, index) => (
                            <motion.div
                                key={agent._id}
                                layout
                                variants={cardVariants}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                    boxShadow: "0 25px 50px -12px rgba(100, 50, 255, 0.15), 0 0 0 1px rgba(255,255,255,0.8)"
                                }}
                                className="group relative bg-white/40 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] p-4 md:p-8 border border-white/50 shadow-[0_10px_30px_rgb(0,0,0,0.02)] flex flex-col h-full overflow-hidden transition-all duration-300"
                            >
                                {/* Gentle Lavender Tint on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-blue-50/0 opacity-0 group-hover:opacity-100 group-hover:from-purple-50/20 group-hover:to-blue-50/20 transition-all duration-500 pointer-events-none" />

                                <div className="relative z-10 flex justify-between items-start mb-6">
                                    <div className="w-18 h-18 rounded-[24px] bg-white/90 shadow-sm p-1.5 flex items-center justify-center border border-white/80 group-hover:shadow-md transition-shadow">
                                        <img src={agent.avatar} className="w-full h-full object-cover rounded-[18px]" />
                                    </div>
                                    <div className="px-3 py-1.5 rounded-full bg-white/60 border border-white/50 text-[9px] font-black uppercase tracking-widest text-gray-500 backdrop-blur-sm">
                                        {agent.category}
                                    </div>
                                </div>

                                <div className="flex-1 relative z-10 space-y-3 mb-8">
                                    <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none group-hover:text-purple-900 transition-colors">
                                        {agent.agentName}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-3 group-hover:text-gray-600">
                                        {agent.description}
                                    </p>
                                </div>

                                <div className="relative z-10 flex items-center gap-3 pt-6 border-t border-purple-50/50 mt-auto">
                                    <button
                                        onClick={() => toggleBuy(agent._id)}
                                        disabled={userAgent.some((ag) => ag && agent._id == ag._id)}
                                        className={`flex-1 py-3.5 px-4 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 ${userAgent.some((ag) => ag && agent._id == ag._id)
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-default opacity-90' // Soft mint/green "Confident & Calm"
                                            : 'bg-purple-600 text-white hover:bg-purple-700 border border-transparent hover:shadow-[0_10px_20px_-5px_rgba(124,58,237,0.3)]'
                                            }`}
                                    >
                                        {userAgent.some((ag) => ag && agent._id == ag._id) ? <><ShieldCheck className="w-3 h-3" /> Deployed</> : 'Install'}
                                    </button>
                                    <button
                                        onClick={() => openAgentInfo(agent)}
                                        className="p-3.5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm hover:shadow-md hover:bg-purple-50"
                                    >
                                        <Info className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Loading State - Premium Spinner */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[300] flex items-center justify-center bg-white/60 backdrop-blur-lg"
                        >
                            <div className="relative w-16 h-16">
                                <span className="absolute inset-0 rounded-full border-4 border-purple-100 opacity-50"></span>
                                <span className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin"></span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Contact Vendor Modal */}
                <ContactVendorModal
                    isOpen={showContactModal}
                    onClose={() => { setShowContactModal(false); setContactAgent(null); }}
                    agent={contactAgent}
                    user={user}
                />
            </div>
        </div>
    );
};

export default Marketplace;
