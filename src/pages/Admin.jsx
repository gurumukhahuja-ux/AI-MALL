import React, { useState } from "react";
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
  LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";

// Sub-Components
import AdminOverview from "../Components/Admin/AdminOverview";
import Approvals from "../Components/Admin/Approvals";
import VendorApprovals from "../Components/Admin/VendorApprovals";
import UserManagement from "../Components/Admin/UserManagement";
import VendorManagement from "../Components/Admin/VendorManagement";
import AgentManagement from "../Components/Admin/AgentManagement";
import Financials from "../Components/Admin/Financials";
import TransactionHistory from "../Components/Admin/TransactionHistory";
import Complaints from "../Components/Admin/Complaints";
import AccessControl from "../Components/Admin/AccessControl";
import PlatformSettings from "../Components/Admin/PlatformSettings";
import AdminSupport from "../Components/Admin/Support";


const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSubTab, setActiveSubTab] = useState("apps");
  const [isRevenueExpanded, setIsRevenueExpanded] = useState(true);
  const [isApprovalsExpanded, setIsApprovalsExpanded] = useState(true);

  const navigation = {
    management: [
      { id: "overview", label: "Control Center", icon: Activity },
      { id: "agents", label: "App Registry", icon: ShoppingBag },
      {
        id: "finance",
        label: "Economy Hub",
        icon: DollarSign,
        hasSub: true,
        subItems: [
          { id: "overview", label: "Financials" },
          { id: "transactions", label: "Trace Logs" }
        ]
      },
      { id: "complaints", label: "Neural Support", icon: AlertTriangle },
      { id: "users", label: "User Identities", icon: Users },
      { id: "vendors", label: "Vendor Nodes", icon: UserCheck },
    ],
    governance: [
      {
        id: "approvals",
        label: "Nexus Approvals",
        icon: CheckCircle,
        hasSub: true,
        subItems: [
          { id: "apps", label: "App Reviews" },
          { id: "vendors", label: "Vendor Requests" }
        ]
      },
      { id: "roles", label: "Access Security", icon: Shield },
      { id: "settings", label: "Core Protocol", icon: Settings },
    ]
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <AdminOverview />;
      case "approvals":
        return activeSubTab === "vendors" ? <VendorApprovals /> : <Approvals />;
      case "users": return <UserManagement />;
      case "vendors": return <VendorManagement />;
      case "agents": return <AgentManagement />;
      case "finance":
        return activeSubTab === "transactions" ? <TransactionHistory /> : <Financials />;
      case "complaints": return <AdminSupport />;
      case "roles": return <AccessControl />;
      case "settings": return <PlatformSettings />;
      default: return <AdminOverview />;
    }
  };

  const NavItem = ({ item }) => {
    const isMainActive = activeTab === item.id;
    const isExpanded = item.id === 'finance' ? isRevenueExpanded : isApprovalsExpanded;

    return (
      <div className="space-y-1">
        <button
          onClick={() => {
            setActiveTab(item.id);
            if (item.hasSub) {
              if (item.id === 'finance') {
                setIsRevenueExpanded(!isRevenueExpanded);
              } else if (item.id === 'approvals') {
                setIsApprovalsExpanded(!isApprovalsExpanded);
              }
            }
          }}
          className={`w-full flex items-center justify-between px-6 py-4 rounded-[28px] transition-all duration-500 text-sm font-black tracking-tight relative group overflow-hidden ${isMainActive
            ? "bg-white text-gray-900 shadow-[0_20px_40px_-10px_rgba(139,92,246,0.1)] border border-white/80"
            : "text-gray-500 hover:text-gray-900"
            }`}
        >
          {isMainActive && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white -z-10"
            />
          )}
          <div className="flex items-center gap-4 relative z-10">
            <div className={`p-2 rounded-xl transition-all ${isMainActive ? 'bg-[#8b5cf6] text-white' : 'bg-gray-100 text-gray-400 group-hover:text-[#8b5cf6]'}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <span className="uppercase tracking-widest text-[10px]">{item.label}</span>
          </div>
          {item.hasSub && (
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4 opacity-40" />
            </motion.div>
          )}
        </button>

        {item.hasSub && isExpanded && (
          <div className="pl-14 space-y-1 mt-1">
            {item.subItems.map(sub => (
              <button
                key={sub.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setActiveSubTab(sub.id);
                }}
                className={`w-full text-left px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isMainActive && activeSubTab === sub.id
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

  return (
    <div className="h-screen flex bg-transparent overflow-hidden">
      {/* Animated Background Orbs for Admin */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d946ef]/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8b5cf6]/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-400/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar - High Fidelity Command Sidebar */}
      <aside className="w-80 bg-white/40 backdrop-blur-3xl border-r border-white/60 flex flex-col shrink-0 relative z-20">
        <div className="p-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-[24px] bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] flex items-center justify-center text-white shadow-2xl shadow-[#8b5cf6]/20 shrink-0 transform -rotate-6">
            <Command className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-gray-900 leading-none">AI MALL<span className="text-[#8b5cf6]">.</span></span>
            <span className="text-[9px] font-black text-[#8b5cf6] uppercase tracking-[0.3em] mt-1 opacity-70">Admin Core v2.1</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-12 py-8 no-scrollbar">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 px-6 opacity-60">Fleet Ops</p>
            <div className="space-y-2">
              {navigation.management.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 px-6 opacity-60">Nexus Meta</p>
            <div className="space-y-2">
              {navigation.governance.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </div>
        </div>

        <div className="p-8">
          <button className="w-full h-16 flex items-center justify-center gap-4 px-6 bg-red-50 text-red-500 rounded-[28px] hover:bg-red-500 hover:text-white transition-all shadow-sm group active:scale-95">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deactivate Token</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="h-[120px] flex items-center justify-between px-12 shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center text-gray-900 shadow-sm">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Protocol Stream</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Status: <span className="text-emerald-500">Nominal 100%</span></p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-5 bg-white/40 backdrop-blur-3xl px-8 py-4 rounded-[32px] border border-white/60 shadow-glass transform hover:scale-105 transition-all cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-60">System Overlord</p>
                <p className="text-base font-black text-gray-900 tracking-tight group-hover:text-[#8b5cf6] transition-colors uppercase">Super User</p>
              </div>
              <div className="w-14 h-14 rounded-[20px] bg-gray-900 flex items-center justify-center text-white font-black shadow-2xl relative">
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#8b5cf6] rounded-full border-2 border-white animate-pulse" />
                S
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-12 no-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
