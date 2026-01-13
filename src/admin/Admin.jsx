import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    Activity,
    Users,
    ShoppingBag,
    DollarSign,
    Shield,
    AlertTriangle,
    CheckCircle,
    Settings,
    UserCheck,
    ChevronDown,
    ChevronUp,
    LogOut,
    Command,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    X,
    Menu,
    Headset
} from "lucide-react";
import { motion } from "framer-motion";

// Sub-Components
import AdminOverview from "./components/AdminOverview";
import Approvals from "./components/Approvals";
import UserManagement from "./components/UserManagement";
import VendorManagement from "./components/VendorManagement";
import AgentManagement from "./components/AgentManagement";
import Financials from "./components/Financials";
import TransactionHistory from "./components/TransactionHistory";
import Complaints from "./components/Complaints";
import AccessControl from "./components/AccessControl";
import PlatformSettings from "./components/PlatformSettings";
import SupportChat from "./components/SupportChat";

const Admin = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [activeSubTab, setActiveSubTab] = useState("overview");
    const [isRevenueExpanded, setIsRevenueExpanded] = useState(true);
    const [userProfile, setUserProfile] = useState({ name: 'Admin', avatar: '' });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserProfile({
            name: user.name || 'Admin',
            avatar: user.avatar || ''
        });

        // Listen for profile updates
        const handleProfileUpdate = () => {
            const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
            setUserProfile({
                name: updatedUser.name || 'Admin',
                avatar: updatedUser.avatar || ''
            });
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    }, []);

    const navigation = {
        management: [
            { id: "overview", label: "Overview", icon: Activity },
            { id: "agents", label: "My Agents", icon: ShoppingBag },
            {
                id: "finance",
                label: "Revenue & Payouts",
                icon: DollarSign,
                hasSub: true,
                subItems: [
                    { id: "overview", label: "Overview" },
                    { id: "transactions", label: "Transaction History" }
                ]
            },
            { id: "complaints", label: "Neural Support", icon: Headset },
            { id: "users", label: "User Management", icon: Users },
            { id: "vendors", label: "Vendor Support", icon: UserCheck },
        ],
        governance: [
            { id: "approvals", label: "Approvals", icon: CheckCircle },
            { id: "roles", label: "Access Control", icon: Shield },
        ]
    };

    const renderContent = () => {
        switch (activeTab) {
            case "overview": return <AdminOverview />;
            case "approvals": return <Approvals />;
            case "users": return <UserManagement />;
            case "vendors": return <VendorManagement />;
            case "agents": return <AgentManagement />;
            case "finance":
                return activeSubTab === "transactions" ? <TransactionHistory /> : <Financials />;
            case "complaints": return <SupportChat />;
            case "roles": return <AccessControl />;
            case "settings": return <PlatformSettings />;
            default: return <AdminOverview />;
        }
    };

    const [sidebarWidth, setSidebarWidth] = useState(260);
    const [resizeState, setResizeState] = useState({ isResizing: false, startX: 0, startWidth: 0 });
    const sidebarRef = useRef(null);

    const startResizing = useCallback((e) => {
        e.preventDefault();
        setResizeState({ isResizing: true, startX: e.clientX, startWidth: sidebarWidth });
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [sidebarWidth]);

    const stopResizing = useCallback(() => {
        setResizeState((prev) => ({ ...prev, isResizing: false }));
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    const resize = useCallback((e) => {
        if (resizeState.isResizing) {
            const delta = e.clientX - resizeState.startX;
            let newWidth = resizeState.startWidth + delta;

            if (newWidth < 80) newWidth = 80;   // Min width
            if (newWidth > 480) newWidth = 480; // Max width

            setSidebarWidth(newWidth);
        }
    }, [resizeState]);

    useEffect(() => {
        if (resizeState.isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
        }
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resizeState.isResizing, resize, stopResizing]);

    const isCompact = sidebarWidth < 180;

    const NavItem = ({ item }) => {
        const isMainActive = activeTab === item.id;

        return (
            <div className="space-y-0.5">
                <button
                    onClick={() => {
                        setActiveTab(item.id);
                        if (item.hasSub && !isCompact) {
                            setIsRevenueExpanded(!isRevenueExpanded);
                        }
                    }}
                    className={`w-full flex items-center ${!isCompact ? 'justify-between px-3' : 'justify-center px-1.5'} py-1.5 rounded-[16px] transition-all duration-200 text-xs font-black tracking-tight relative group overflow-hidden ${isMainActive
                        ? "bg-white text-gray-900 shadow-[0_10px_20px_-5px_rgba(139,92,246,0.1)] border border-white/80"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                    title={isCompact ? item.label : ""}
                >
                    {isMainActive && (
                        <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-white -z-10"
                        />
                    )}
                    <div className="flex items-center gap-3 relative z-10">
                        <div className={`p-1.5 rounded-lg transition-all ${isMainActive ? 'bg-[#8b5cf6] text-white' : 'bg-gray-100 text-gray-400 group-hover:text-[#8b5cf6]'}`}>
                            <item.icon className="w-3.5 h-3.5" />
                        </div>
                        {!isCompact && <span className="uppercase tracking-widest text-[11px] whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
                    </div>
                    {item.hasSub && !isCompact && (
                        <motion.div animate={{ rotate: isRevenueExpanded ? 180 : 0 }}>
                            <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                        </motion.div>
                    )}
                </button>

                {item.hasSub && isRevenueExpanded && !isCompact && (
                    <div className="pl-11 space-y-0.5 mt-0.5">
                        {item.subItems.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setActiveSubTab(sub.id);
                                }}
                                className={`w-full text-left px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isMainActive && activeSubTab === sub.id
                                    ? "text-[#8b5cf6] bg-white/60 shadow-sm"
                                    : "text-gray-400 hover:text-[#8b5cf6] hover:bg-white/30"
                                    }`}
                            >
                                {sub.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="h-screen flex bg-transparent overflow-hidden">
            {/* Animated Background Orbs for Admin */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d946ef]/10 rounded-full blur-[120px] animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8b5cf6]/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-400/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
            </div>

            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar - High Fidelity Command Sidebar */}
            <aside
                ref={sidebarRef}
                className={`
                    fixed lg:relative inset-y-0 left-0 z-50 
                    bg-white/40 backdrop-blur-3xl border-r border-white/60 
                    flex flex-col shrink-0 transition-transform duration-300 ease-in-out
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
                style={{ width: window.innerWidth >= 1024 ? `${sidebarWidth}px` : '280px' }}
            >
                {/* Resize Handle (Desktop Only) */}
                <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-purple-500/50 transition-colors z-50 group hidden lg:block"
                    onMouseDown={startResizing}
                >
                    <div className={`absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${resizeState.isResizing ? 'opacity-100' : ''}`}>
                        <div className="w-0.5 h-3 bg-gray-300 rounded-full mx-0.5" />
                        <div className="w-0.5 h-3 bg-gray-300 rounded-full mx-0.5" />
                    </div>
                </div>

                <div className={`p-4 flex items-center ${!isCompact ? 'justify-between' : 'justify-center'} gap-4 overflow-hidden`}>
                    {!isCompact ? (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-[16px] bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] flex items-center justify-center text-white shadow-2xl shadow-[#8b5cf6]/20 shrink-0 transform -rotate-6">
                                    <Command className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-black text-xl tracking-tighter text-gray-900 leading-none truncate">ADMIN<span className="text-[#8b5cf6]">.</span></span>
                                </div>
                            </div>

                            {/* Close Button (Mobile Only) */}
                            <button
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className="lg:hidden p-2 rounded-xl hover:bg-white/40 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] flex items-center justify-center text-white shadow-2xl shadow-[#8b5cf6]/20 shrink-0">
                            <span className="font-black text-sm">A</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-4 py-3 no-scrollbar overflow-x-hidden">
                    <div>
                        {!isCompact && <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-3 opacity-60 animate-in fade-in duration-300 whitespace-nowrap">MANAGEMENT</p>}
                        <div className="space-y-0.5">
                            {navigation.management.map(item => <NavItem key={item.id} item={item} />)}
                        </div>
                    </div>

                    <div>
                        {!isCompact && <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-3 opacity-60 animate-in fade-in duration-300 whitespace-nowrap">GOVERNANCE</p>}
                        <div className="space-y-0.5">
                            {navigation.governance.map(item => <NavItem key={item.id} item={item} />)}
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <button className={`w-full ${!isCompact ? 'h-10 px-6' : 'h-10 px-0 justify-center'} flex items-center gap-4 bg-red-50 text-red-500 rounded-[28px] hover:bg-red-500 hover:text-white transition-all shadow-sm group active:scale-95 overflow-hidden`}>
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform shrink-0" />
                        {!isCompact && <span className="text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Deactivate Token</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <header className="h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0">
                    <div className="flex items-center gap-4 lg:gap-6">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="p-2 lg:hidden bg-white/40 border border-white/60 rounded-xl text-gray-600 hover:text-[#8b5cf6] transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        {/* Systems Operational section removed */}
                    </div>

                    <div className="flex items-center gap-8">
                        <div
                            onClick={() => setActiveTab('settings')}
                            className="flex items-center gap-5 bg-white/40 backdrop-blur-3xl px-1.5 py-1.5 rounded-[20px] border border-white/60 shadow-glass transform hover:scale-105 transition-all cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-[14px] bg-gray-900 flex items-center justify-center text-white font-black shadow-2xl relative overflow-hidden">
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#8b5cf6] rounded-full border-2 border-white animate-pulse" />
                                {userProfile.avatar ? (
                                    <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    userProfile.name.charAt(0).toUpperCase()
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Viewport */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 no-scrollbar pb-20 lg:pb-6">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Admin;
